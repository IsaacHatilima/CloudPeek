import { useRouter } from "expo-router";
import { useCallback } from "react";

import { resourceActions } from "@/features/actions/action-catalog";
import { actionHref } from "@/features/actions/action-route";
import type { ResourceMenuItem } from "@/features/cloud-resources/types";
import { detailPath } from "@/features/shell/resource-navigation";

import type { RowModel } from "./presenters";

/** Where a list's rows and its create button lead: an item's detail, and the create form. */
export function useListNavigation(
  item: ResourceMenuItem,
  params: Record<string, string>,
  parentId?: string,
) {
  const router = useRouter();
  const create = resourceActions(item.id).create;

  const openItem = useCallback(
    (row: RowModel) => router.push(detailPath(item.id, row.id, parentId)),
    [item.id, parentId, router],
  );

  const openCreate = useCallback(() => {
    if (!create) return;
    router.push(
      actionHref({ mode: "create", operationId: create.operationId, params, parentId, resourceId: item.id }),
    );
  }, [create, item.id, params, parentId, router]);

  return { create, openCreate, openItem } as const;
}
