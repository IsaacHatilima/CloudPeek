/**
 * The active organization → application → environment, plus the catalogs the
 * switchers pick from. Every screen reads its scope from here.
 *
 * Persisted: the connected organizations and the selection (as refs, so the
 * header renders immediately on relaunch). Not persisted: the application and
 * environment catalogs, which belong to a session and are refetched.
 *
 * Organizations are "connected", not fetched: a Cloud API token is minted per
 * organization and there is no endpoint that lists a user's organizations, so
 * the list here is whatever the (future) authentication pass registers.
 */
import { create } from "zustand";
import {
  createJSONStorage,
  persist,
  type StateStorage,
} from "zustand/middleware";

import { fileStorage } from "@/lib/file-storage";
import { reportStorageFailure } from "@/lib/storage-failure";

import type {
  ApplicationRef,
  EnvironmentRef,
  OrganizationRef,
  WorkspaceSelection,
} from "./types";

export const WORKSPACE_STORAGE_KEY = "cloudpeek-workspace";

const EMPTY_SELECTION: WorkspaceSelection = {
  application: null,
  environment: null,
  organization: null,
};

export type WorkspaceState = {
  applications: readonly ApplicationRef[];
  environments: readonly EnvironmentRef[];
  organizations: readonly OrganizationRef[];
  selection: WorkspaceSelection;
  addOrganization(organization: OrganizationRef): void;
  clearSelection(): void;
  removeOrganization(organizationId: string): void;
  selectApplication(application: ApplicationRef): void;
  selectEnvironment(environment: EnvironmentRef): void;
  selectOrganization(organization: OrganizationRef): void;
  setApplications(applications: readonly ApplicationRef[]): void;
  setEnvironments(environments: readonly EnvironmentRef[]): void;
  setOrganizations(organizations: readonly OrganizationRef[]): void;
};

export type PersistedWorkspace = Pick<
  WorkspaceState,
  "organizations" | "selection"
>;

type SetWorkspace = (
  updater:
    | Partial<WorkspaceState>
    | ((state: WorkspaceState) => Partial<WorkspaceState>),
) => void;

/** The slice that reaches disk. Catalogs are deliberately left out. */
export function persistedWorkspace(state: WorkspaceState): PersistedWorkspace {
  return { organizations: state.organizations, selection: state.selection };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isRef(value: unknown): value is OrganizationRef {
  return (
    isRecord(value) && typeof value.id === "string" && typeof value.name === "string"
  );
}

function isRefOrNull(value: unknown): boolean {
  return value === null || isRef(value);
}

/**
 * Guards what comes back from disk. A file that reads and parses but has the
 * wrong shape (tampering, a migration gap) must fall back to defaults like
 * every other storage failure, not crash the first switcher that maps it.
 */
export function isPersistedWorkspace(value: unknown): value is PersistedWorkspace {
  if (!isRecord(value) || !isRecord(value.selection)) return false;

  const { organizations, selection } = value;

  return (
    Array.isArray(organizations) &&
    organizations.every(isRef) &&
    isRefOrNull(selection.organization) &&
    isRefOrNull(selection.application) &&
    isRefOrNull(selection.environment)
  );
}

function mergePersisted(persisted: unknown, current: WorkspaceState): WorkspaceState {
  if (persisted === undefined || persisted === null) return current;
  if (isPersistedWorkspace(persisted)) return { ...current, ...persisted };

  reportStorageFailure(
    "file",
    "rehydrate",
    WORKSPACE_STORAGE_KEY,
    new Error("stored workspace has an unexpected shape; using defaults"),
  );
  return current;
}

/** Selecting at one level resets everything below it; re-selecting the same thing keeps it. */
function selectionActions(set: SetWorkspace) {
  return {
    clearSelection: () => set({ selection: EMPTY_SELECTION }),

    selectApplication: (application: ApplicationRef) =>
      set((state) =>
        state.selection.application?.id === application.id
          ? { selection: { ...state.selection, application } }
          : {
              environments: [],
              selection: { ...state.selection, application, environment: null },
            },
      ),

    selectEnvironment: (environment: EnvironmentRef) =>
      set((state) => ({ selection: { ...state.selection, environment } })),

    selectOrganization: (organization: OrganizationRef) =>
      set((state) =>
        state.selection.organization?.id === organization.id
          ? { selection: { ...state.selection, organization } }
          : {
              applications: [],
              environments: [],
              selection: { application: null, environment: null, organization },
            },
      ),
  };
}

/** Connected organizations come and go one at a time; a new one becomes the active one. */
function connectionActions(set: SetWorkspace) {
  return {
    addOrganization: (organization: OrganizationRef) =>
      set((state) => ({
        applications: [],
        environments: [],
        organizations: [
          ...state.organizations.filter((known) => known.id !== organization.id),
          organization,
        ],
        selection: { application: null, environment: null, organization },
      })),

    removeOrganization: (organizationId: string) =>
      set((state) => ({
        organizations: state.organizations.filter((known) => known.id !== organizationId),
        ...(state.selection.organization?.id === organizationId
          ? { applications: [], environments: [], selection: EMPTY_SELECTION }
          : {}),
      })),
  };
}

/** Catalogs are replaced wholesale; losing the selected organization clears the selection. */
function catalogActions(set: SetWorkspace) {
  return {
    setApplications: (applications: readonly ApplicationRef[]) =>
      set({ applications: [...applications] }),

    setEnvironments: (environments: readonly EnvironmentRef[]) =>
      set({ environments: [...environments] }),

    setOrganizations: (organizations: readonly OrganizationRef[]) =>
      set((state) => {
        const selected = state.selection.organization;
        const stillConnected =
          selected !== null &&
          organizations.some((candidate) => candidate.id === selected.id);

        return stillConnected
          ? { organizations: [...organizations] }
          : {
              applications: [],
              environments: [],
              organizations: [...organizations],
              selection: EMPTY_SELECTION,
            };
      }),
  };
}

export function createWorkspaceStore(storage: StateStorage) {
  return create<WorkspaceState>()(
    persist(
      (set) => ({
        applications: [],
        environments: [],
        organizations: [],
        selection: EMPTY_SELECTION,
        ...selectionActions(set),
        ...catalogActions(set),
        ...connectionActions(set),
      }),
      {
        merge: mergePersisted,
        name: WORKSPACE_STORAGE_KEY,
        partialize: persistedWorkspace,
        storage: createJSONStorage(() => storage),
        version: 1,
        onRehydrateStorage: () => (_state, error) => {
          if (error) {
            reportStorageFailure("file", "rehydrate", WORKSPACE_STORAGE_KEY, error);
          }
        },
      },
    ),
  );
}

export const useWorkspaceStore = createWorkspaceStore(fileStorage);
