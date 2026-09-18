import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";

import { useWorkspaceStore } from "@/features/workspace/workspace-store";
import { createCloudApi } from "@/services/cloud-api/client";

import { connectOrganization } from "./connect-organization";
import { tokenVault } from "./secure-token-storage";
import { TOKEN_QUERY_KEY } from "./use-cloud-api";

/** Replace cached credentials before selecting the organization and mounting its reads. */
export function useConnectOrganization() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const register = useWorkspaceStore((state) => state.addOrganization);

  return useMutation({
    mutationFn: (token: string) => connectOrganization(token, {
      createApi: createCloudApi,
      vault: tokenVault,
      register: async (organization) => {
        await queryClient.cancelQueries({ queryKey: [TOKEN_QUERY_KEY, organization.id] });
        await queryClient.cancelQueries({ queryKey: ["cloud", organization.id] });
        queryClient.setQueryData([TOKEN_QUERY_KEY, organization.id], token.trim());
        queryClient.removeQueries({ queryKey: ["cloud", organization.id] });
        register(organization);
      },
    }),
    onSuccess: () => router.dismissAll(),
  });
}
