import { useMemo } from "react";

import type { CloudEndpoint } from "@/features/cloud-resources/types";
import { useCloudConnection } from "@/features/connections/use-cloud-api";

import { useResourceQuery } from "../use-resource-query";
import { type LocatedItem, locateItem } from "./detail-model";

export type ResourceItemState =
  | { error: unknown; kind: "error"; refetch: () => void }
  | { kind: "loading" }
  | { kind: "missing"; refetch: () => void }
  | { kind: "not-connected" }
  | ({ isRefetching: boolean; kind: "ready"; refetch: () => void } & LocatedItem);

/**
 * One item out of its list, read through the same cached query the list
 * screen uses, so opening a row costs no extra request.
 */
export function useResourceItem(
  endpoint: CloudEndpoint,
  params: Record<string, string>,
  itemId: string,
): ResourceItemState {
  const { api, isLoading: isLoadingToken } = useCloudConnection();
  const query = useResourceQuery(api, endpoint, params);
  const located = useMemo(() => locateItem(query.data, itemId), [itemId, query.data]);
  const refetch = () => void query.refetch();

  if (isLoadingToken) return { kind: "loading" };
  if (api === null) return { kind: "not-connected" };
  if (query.isPending) return { kind: "loading" };
  if (query.error) return { error: query.error, kind: "error", refetch };
  if (!located) return { kind: "missing", refetch };
  return { ...located, isRefetching: query.isRefetching, kind: "ready", refetch };
}
