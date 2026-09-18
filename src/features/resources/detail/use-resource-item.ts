import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { detailRequest } from "@/features/cloud-resources/detail-endpoints";
import type { CloudEndpoint } from "@/features/cloud-resources/types";
import { useCloudConnection } from "@/features/connections/use-cloud-api";
import { useWorkspaceSelection } from "@/features/workspace/use-workspace";
import { CloudApiError, CloudApiNotConnectedError } from "@/services/cloud-api/client";
import { isAuthenticationError } from "@/services/cloud-api/errors";
import type { ResourceData } from "../use-resource-query";

import { type LocatedItem, locateItem } from "./detail-model";

export type ResourceItemState =
  | { error: unknown; kind: "error"; refetch: () => void }
  | { kind: "loading" }
  | { kind: "missing"; refetch: () => void }
  | { kind: "not-connected" }
  | ({ isRefetching: boolean; kind: "ready"; refetch: () => void; refreshFailed: boolean } & LocatedItem);

/**
 * Read the documented item endpoint, including records beyond page one.
 * List-only resources search all pages; failed refreshes retain usable details.
 */
export function useResourceItem(
  endpoint: CloudEndpoint,
  params: Record<string, string>,
  itemId: string,
): ResourceItemState {
  const { api, isLoading: isLoadingToken } = useCloudConnection();
  const { organization } = useWorkspaceSelection();
  const request = detailRequest(endpoint, params, itemId);
  const query = useQuery<ResourceData>({
    enabled: api !== null,
    queryKey: ["cloud", organization?.id, "detail", endpoint.operationId, params, itemId],
    queryFn: () => {
      if (!api) throw new CloudApiNotConnectedError();
      return request
        ? api.get(request.endpoint, request.params, request.endpoint.defaultQuery?.())
        : api.listAll(endpoint, params, endpoint.defaultQuery?.());
    },
  });
  const located = useMemo(() => locateItem(query.data, itemId), [itemId, query.data]);
  const refetch = () => void query.refetch();

  if (isLoadingToken) return { kind: "loading" };
  if (api === null) return { kind: "not-connected" };
  if (query.isPending) return { kind: "loading" };
  if (query.error instanceof CloudApiError && query.error.status === 404) return { kind: "missing", refetch };
  if (query.error && (!located || isAuthenticationError(query.error))) return { error: query.error, kind: "error", refetch };
  if (!located) return { kind: "missing", refetch };
  return { ...located, isRefetching: query.isRefetching, kind: "ready", refetch, refreshFailed: Boolean(query.error) };
}
