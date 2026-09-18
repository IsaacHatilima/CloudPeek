import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import type { CloudEndpoint } from "@/features/cloud-resources/types";
import { useWorkspaceSelection } from "@/features/workspace/use-workspace";
import type { QueryParams } from "@/services/cloud-api/build-path";
import { type CloudApi, CloudApiNotConnectedError } from "@/services/cloud-api/client";
import { mergePages, nextPageQuery } from "@/services/cloud-api/pagination";

/** Page and cursor reads share one stable query, including a fixed log window. */
export function useResourceListQuery(api: CloudApi | null, endpoint: CloudEndpoint, params: Record<string, string>) {
  const { organization } = useWorkspaceSelection();
  const query = useInfiniteQuery({
    enabled: api !== null,
    initialPageParam: {} as QueryParams,
    queryKey: ["cloud", organization?.id, endpoint.operationId, params, "pages"],
    queryFn: async ({ pageParam }) => {
      if (!api) throw new CloudApiNotConnectedError();
      const requestQuery = Object.keys(pageParam).length ? pageParam : endpoint.defaultQuery?.() ?? {};
      return { page: await api.list(endpoint, params, requestQuery), requestQuery };
    },
    getNextPageParam: (last, _pages, _lastParam, pageParams) => {
      const next = nextPageQuery(last.page, last.requestQuery);
      return next && !pageParams.some((param) => JSON.stringify(param) === JSON.stringify(next)) ? next : undefined;
    },
  });
  const data = useMemo(() => query.data ? mergePages(query.data.pages.map(({ page }) => page)) : undefined, [query.data]);
  return { ...query, data };
}
