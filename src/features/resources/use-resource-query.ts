import { useQuery } from "@tanstack/react-query";

import type { CloudEndpoint } from "@/features/cloud-resources/types";
import { useWorkspaceSelection } from "@/features/workspace/use-workspace";
import { type CloudApi, CloudApiNotConnectedError } from "@/services/cloud-api/client";
import type { JsonApiSingle, ListEnvelope, ReportEnvelope } from "@/services/cloud-api/types";

export type ResourceData = JsonApiSingle | ListEnvelope | ReportEnvelope;

/** One Cloud read for the active organization, cached by endpoint and params. */
export function useResourceQuery(
  api: CloudApi | null,
  endpoint: CloudEndpoint,
  params: Record<string, string>,
) {
  const { organization } = useWorkspaceSelection();
  const query = endpoint.defaultQuery?.();

  return useQuery<ResourceData>({
    enabled: api !== null,
    queryFn: () => {
      if (!api) throw new CloudApiNotConnectedError();
      return endpoint.kind === "collection" || endpoint.kind === "list"
        ? api.list(endpoint, params, query)
        : api.get(endpoint, params, query);
    },
    queryKey: ["cloud", organization?.id, endpoint.operationId, params, query],
  });
}
