import { findResource } from "@/features/cloud-resources/catalog";
import type { WorkspaceSelection } from "@/features/workspace/types";
import { reportStorageFailure } from "@/lib/storage-failure";

export const NAVIGATION_STORAGE_KEY = "cloudpeek-navigation";

type NavigationStorage = {
  getItem(name: string): unknown;
  setItem(name: string, value: string): unknown;
};

type Destination = { href: string; scope: string };
type Location = { pathname: string; parent?: string; selection: WorkspaceSelection };

function scopeKey(selection: WorkspaceSelection): string {
  return JSON.stringify([
    selection.organization?.id ?? null,
    selection.application?.id ?? null,
    selection.environment?.id ?? null,
  ]);
}

/** Persist resource screens only, with the one query parameter they need. */
function resourceHref(pathname: string, parent?: string): string | null {
  if (pathname === "/") return "/";
  const match = /^\/resources\/([^/?#]+)(?:\/([^/?#]+))?$/.exec(pathname);
  if (!match || !findResource(match[1])) return null;
  return parent ? `${pathname}?parent=${encodeURIComponent(parent)}` : pathname;
}

function readDestination(storage: NavigationStorage): Destination | null {
  try {
    const raw = storage.getItem(NAVIGATION_STORAGE_KEY);
    if (typeof raw !== "string") return null;
    const value: unknown = JSON.parse(raw);
    if (typeof value !== "object" || value === null) return null;
    const { href, scope } = value as Partial<Destination>;
    if (typeof href !== "string" || typeof scope !== "string") return null;
    const [pathname, query] = href.split("?");
    const params = new URLSearchParams(query);
    // Reject unknown paths, extra parameters, and malformed saved destinations.
    if (resourceHref(pathname, params.get("parent") ?? undefined) !== href) return null;
    return { href, scope };
  } catch (error) {
    reportStorageFailure("file", "read", NAVIGATION_STORAGE_KEY, error);
    return null;
  }
}

/** One session per navigator mount: restore once, then remember actual navigation. */
export function createNavigationSession(storage: NavigationStorage) {
  let first = true;
  let restoring: string | null = null;
  let saved = readDestination(storage);

  return {
    observe({ pathname, parent, selection }: Location): string | null {
      const scope = scopeKey(selection);
      const href = resourceHref(pathname, parent);
      if (first) {
        first = false;
        // A routed incoming link takes precedence over the saved screen.
        if (pathname === "/" && saved?.scope === scope && saved.href !== "/") {
          restoring = saved.href;
          return restoring;
        }
      }
      // Do not replace the saved screen with the initial home render while
      // the router is completing the restore (or a sheet is mounted).
      if (restoring && restoring !== href) return null;
      restoring = null;
      if (!href || (saved?.href === href && saved.scope === scope)) return null;
      saved = { href, scope };
      try {
        storage.setItem(NAVIGATION_STORAGE_KEY, JSON.stringify(saved));
      } catch (error) {
        reportStorageFailure("file", "write", NAVIGATION_STORAGE_KEY, error);
      }
      return null;
    },
  };
}
