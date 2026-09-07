import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useCloudApi } from "@/features/connections/use-cloud-api";
import { useWorkspaceSelection } from "@/features/workspace/use-workspace";
import { CloudApiNotConnectedError, type WriteInput } from "@/services/cloud-api/client";
import type { WriteOperation } from "@/services/cloud-api/operation-types";

export type WriteVariables = { input: WriteInput; op: WriteOperation };

/**
 * Runs one write against the active organization. Afterwards every cached
 * read for that organization is invalidated, so lists and details refetch
 * whatever the write changed without knowing which operation ran.
 */
export function useWriteAction() {
  const api = useCloudApi();
  const queryClient = useQueryClient();
  const { organization } = useWorkspaceSelection();
  const organizationId = organization?.id;

  return useMutation({
    mutationFn: ({ input, op }: WriteVariables) => {
      if (!api) throw new CloudApiNotConnectedError();
      return api.request(op, input);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cloud", organizationId] }),
  });
}
