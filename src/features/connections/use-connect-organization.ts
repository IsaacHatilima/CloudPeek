import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";

import { useWorkspaceStore } from "@/features/workspace/workspace-store";
import { createCloudApi } from "@/services/cloud-api/client";

import { connectOrganization } from "./connect-organization";
import { tokenVault } from "./secure-token-storage";
import { TOKEN_QUERY_KEY } from "./use-cloud-api";

/** The connect form's mutation: on success, refresh token lookups and close every sheet. */
export function useConnectOrganization() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const register = useWorkspaceStore((state) => state.addOrganization);

  return useMutation({
    mutationFn: (token: string) =>
      connectOrganization(token, { createApi: createCloudApi, register, vault: tokenVault }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [TOKEN_QUERY_KEY] });
      router.dismissAll();
    },
  });
}
