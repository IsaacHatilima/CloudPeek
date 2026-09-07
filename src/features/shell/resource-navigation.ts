import type { ResourceId } from "@/features/cloud-resources/types";

/** Resources that are the Stack's first screen instead of a pushed one. */
const HOME_RESOURCES: Partial<Record<ResourceId, string>> = {
  environments: "/",
};

/** Routes presented as sheets over the shell; the header stays visible above them. */
const SHEET_ROUTES: ReadonlySet<string> = new Set(["action", "connect", "scope"]);

export function isSheetPath(pathname: string): boolean {
  return SHEET_ROUTES.has(pathname.replace(/^\//, ""));
}

const HOME_PATHS: readonly string[] = ["/"];
const RESOURCE_ROUTE = /^\/resources\/([^/]+)(?:\/([^/]+))?$/;
const RESOURCE_ROUTE_NAMES: ReadonlySet<string> = new Set([
  "resources/[resource]",
  "resources/[resource]/[id]",
  "resources/[resource]/index",
]);

export function resourcePath(id: ResourceId | string): string {
  return HOME_RESOURCES[id as ResourceId] ?? `/resources/${id}`;
}

function withParent(path: string, parentId?: string): string {
  return parentId ? `${path}?parent=${encodeURIComponent(parentId)}` : path;
}

/** A resource list scoped to a parent picked on screen (an instance, a cluster, a bucket). */
export function childListPath(id: ResourceId | string, parentId: string): string {
  return withParent(`/resources/${id}`, parentId);
}

/** One item's detail screen; `parentId` is carried along for parent-scoped resources. */
export function detailPath(id: ResourceId | string, itemId: string, parentId?: string): string {
  return withParent(`/resources/${id}/${encodeURIComponent(itemId)}`, parentId);
}

export function isDetailPath(pathname: string): boolean {
  return RESOURCE_ROUTE.exec(pathname)?.[2] !== undefined;
}

export function isHomePath(pathname: string): boolean {
  return HOME_PATHS.includes(pathname);
}

function homeResourceFor(pathname: string): ResourceId | null {
  const entry = Object.entries(HOME_RESOURCES).find(([, path]) => path === pathname);
  return entry ? (entry[0] as ResourceId) : null;
}

/** The resource id a pathname shows: pushed, at home, or one of its items; null elsewhere. */
export function activeResourceId(pathname: string): string | null {
  const atHome = homeResourceFor(pathname);
  if (atHome) return atHome;

  const match = RESOURCE_ROUTE.exec(pathname);
  return match ? match[1] : null;
}

export type ResourceNavigationAction = "navigate" | "none" | "push" | "replace";

/**
 * Drawer semantics on a stack: push from home so back returns there, replace
 * between pushed resources so the stack stays shallow, a plain navigate for
 * the home resource or to return from an item to its own list.
 */
export function resourceNavigationAction(
  pathname: string,
  id: ResourceId | string,
): ResourceNavigationAction {
  if (pathname === resourcePath(id)) return "none";
  if (id in HOME_RESOURCES || activeResourceId(pathname) === id) return "navigate";
  return activeResourceId(pathname) !== null && !isHomePath(pathname)
    ? "replace"
    : "push";
}

export type NavigationRouteLike = {
  name: string;
  params?: object;
  state?: NavigationStateLike;
};

export type NavigationStateLike = {
  index?: number;
  routes: readonly NavigationRouteLike[];
};

function activeRoute(state: NavigationStateLike): NavigationRouteLike | null {
  return state.routes[state.index ?? state.routes.length - 1] ?? null;
}

/**
 * The screen a sheet is covering. Expo Router nests the app's stack inside an
 * internal `__root` route, so this descends until it finds the sheet on top;
 * the route before it is the covered one, resolved to its active child when
 * it is a navigator of its own.
 */
export function coveredRoute(
  state: NavigationStateLike | undefined,
): NavigationRouteLike | null {
  if (!state) return null;

  const { routes } = state;
  const top = routes[routes.length - 1];
  if (!top) return null;
  if (!SHEET_ROUTES.has(top.name)) {
    return top.state ? coveredRoute(top.state) : null;
  }

  const covered = routes[routes.length - 2];
  if (!covered) return null;
  return covered.state ? activeRoute(covered.state) : covered;
}

/** The resource a route shows: a pushed resource screen, or the home screen. */
export function routeResourceId(route: NavigationRouteLike): string | null {
  if (RESOURCE_ROUTE_NAMES.has(route.name)) {
    const params = route.params as { resource?: unknown } | undefined;
    return typeof params?.resource === "string" ? params.resource : null;
  }
  return homeResourceFor(route.name === "index" ? "/" : `/${route.name}`);
}

export function coveredResourceId(
  state: NavigationStateLike | undefined,
): string | null {
  const route = coveredRoute(state);
  return route ? routeResourceId(route) : null;
}
