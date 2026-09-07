import { useWorkspaceStore } from "./workspace-store";

export function useWorkspaceSelection() {
  return useWorkspaceStore((state) => state.selection);
}

export function useConnectedOrganizations() {
  return useWorkspaceStore((state) => state.organizations);
}

export function useApplications() {
  return useWorkspaceStore((state) => state.applications);
}

export function useEnvironments() {
  return useWorkspaceStore((state) => state.environments);
}
