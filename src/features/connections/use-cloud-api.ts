import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { useWorkspaceSelection } from "@/features/workspace/use-workspace";
import { type CloudApi, createCloudApi } from "@/services/cloud-api/client";

import { tokenVault } from "./secure-token-storage";

export const TOKEN_QUERY_KEY = "token";

/**
 * The API for the active organization, or null while there is no organization
 * or no stored token for it. Screens treat null as "not connected".
 */
export function useCloudConnection() {
  const { organization } = useWorkspaceSelection();
  const organizationId = organization?.id ?? null;
  const { data: token, isPending } = useQuery({
    enabled: organizationId !== null,
    queryFn: () => (organizationId ? tokenVault.getToken(organizationId) : null),
    queryKey: [TOKEN_QUERY_KEY, organizationId],
    staleTime: Infinity,
  });

  const api = useMemo(() => (token ? createCloudApi({ token }) : null), [token]);
  return { api, isLoading: organizationId !== null && isPending };
}

export function useCloudApi(): CloudApi | null {
  return useCloudConnection().api;
}
