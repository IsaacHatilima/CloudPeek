/**
 * The scope sheet, as data: which level is showing, the crumbs above it, the
 * entries to pick from, and what picking one leads to. Pure, so the sheet's
 * behaviour is tested without rendering it.
 */
import type {
  ApplicationRef,
  EnvironmentRef,
  OrganizationRef,
  ScopeLevel,
  WorkspaceSelection,
} from "@/features/workspace/types";

/** Above this many entries a level gets a search field. */
export const SEARCH_THRESHOLD = 8;

export type ScopeItem = {
  /** Applications carry one: their Cloud avatar, or initials from the name. */
  avatar?: { name: string; uri?: string };
  id: string;
  name: string;
  slug?: string;
  status?: string;
};

export type ScopeCrumb = { current: boolean; label: string; level: ScopeLevel };

export type ScopeSource = {
  applications: readonly ApplicationRef[];
  environments: readonly EnvironmentRef[];
  organizations: readonly OrganizationRef[];
  selection: WorkspaceSelection;
};

export type ScopeLevelModel = {
  /** Footer action on the organization level; null elsewhere. */
  connectLabel: string | null;
  crumbs: readonly ScopeCrumb[];
  emptyMessage: string;
  items: readonly ScopeItem[];
  level: ScopeLevel;
  searchable: boolean;
  selectedId: string | null;
  title: string;
};

const TITLES: Record<ScopeLevel, string> = {
  application: "Applications",
  environment: "Environments",
  organization: "Organizations",
};

const EMPTY: Record<ScopeLevel, (selection: WorkspaceSelection) => string> = {
  application: (selection) =>
    `No applications loaded for ${selection.organization?.name ?? "this organization"} yet.`,
  environment: (selection) =>
    `No environments loaded for ${selection.application?.name ?? "this application"} yet.`,
  organization: () =>
    "No organizations connected yet. Connect one with a Laravel Cloud API token from the organization's settings.",
};

/** Each level needs the one above it selected; requests are pulled up until that holds. */
export function effectiveLevel(requested: ScopeLevel, selection: WorkspaceSelection): ScopeLevel {
  if (!selection.organization) return "organization";
  if (requested === "environment" && !selection.application) return "application";
  return requested;
}

/** Where the header opens: the first level still needing a choice, else environments. */
export function deepestOpenLevel(selection: WorkspaceSelection): ScopeLevel {
  if (!selection.organization) return "organization";
  if (!selection.application) return "application";
  return "environment";
}

/** Picking descends one level; picking an environment is the end. */
export function nextLevelAfterPick(level: ScopeLevel): ScopeLevel | null {
  if (level === "organization") return "application";
  if (level === "application") return "environment";
  return null;
}

export function filterItems(items: readonly ScopeItem[], search: string): readonly ScopeItem[] {
  const needle = search.trim().toLowerCase();
  if (!needle) return items;
  return items.filter(
    (item) =>
      item.name.toLowerCase().includes(needle) ||
      (item.slug?.toLowerCase().includes(needle) ?? false),
  );
}

export function scopeCrumbs(level: ScopeLevel, selection: WorkspaceSelection): readonly ScopeCrumb[] {
  const above: ScopeCrumb[] = [];
  if (level !== "organization" && selection.organization) {
    above.push({ current: false, label: selection.organization.name, level: "organization" });
  }
  if (level === "environment" && selection.application) {
    above.push({ current: false, label: selection.application.name, level: "application" });
  }
  return [...above, { current: true, label: TITLES[level], level }];
}

function applicationItem(application: ApplicationRef): ScopeItem {
  const { avatarUrl, ...rest } = application;
  return { ...rest, avatar: { name: application.name, uri: avatarUrl } };
}

function itemsAt(level: ScopeLevel, source: ScopeSource): readonly ScopeItem[] {
  if (level === "organization") return source.organizations;
  return level === "application" ? source.applications.map(applicationItem) : source.environments;
}

function selectedAt(level: ScopeLevel, selection: WorkspaceSelection): string | null {
  const chosen =
    level === "organization"
      ? selection.organization
      : level === "application"
        ? selection.application
        : selection.environment;
  return chosen?.id ?? null;
}

export function scopeLevelModel(
  requested: ScopeLevel,
  source: ScopeSource,
  search = "",
): ScopeLevelModel {
  const level = effectiveLevel(requested, source.selection);
  const all = itemsAt(level, source);
  const trimmed = search.trim();

  return {
    connectLabel:
      level === "organization"
        ? source.organizations.length > 0
          ? "Connect another organization"
          : "Connect an organization"
        : null,
    crumbs: scopeCrumbs(level, source.selection),
    emptyMessage: trimmed ? `Nothing matches "${trimmed}".` : EMPTY[level](source.selection),
    items: filterItems(all, search),
    level,
    searchable: all.length > SEARCH_THRESHOLD,
    selectedId: selectedAt(level, source.selection),
    title: TITLES[level],
  };
}
