import { useRouter } from "expo-router";
import { useCallback } from "react";

import { actionHref } from "@/features/actions/action-route";
import { resolveScope } from "@/features/cloud-resources/scope";
import { childListPath } from "@/features/shell/resource-navigation";
import { useWorkspaceSelection } from "@/features/workspace/use-workspace";
import { useWorkspaceStore } from "@/features/workspace/workspace-store";
import type { RowModel } from "../presenters";

import type { ChildLink } from "./detail-model";

/**
 * Opens a child of the current item: its list, scoped to this item as the
 * parent, or straight into the create form when the child has no list
 * (a cluster's restore).
 */
export function useChildNavigation(resourceId: string, row: RowModel) {
  const router = useRouter();
  const selection = useWorkspaceSelection();
  const selectApplication = useWorkspaceStore((state) => state.selectApplication);
  const selectEnvironment = useWorkspaceStore((state) => state.selectEnvironment);

  return useCallback(
    (link: ChildLink) => {
      const itemId = row.id;
      if (link.listable) {
        if (resourceId === "applications") selectApplication({ id: itemId, name: row.title, avatarUrl: row.avatar?.uri });
        if (resourceId === "environments") selectEnvironment({ id: itemId, name: row.title, status: row.status });
        router.push(childListPath(link.item.id, itemId));
        return;
      }
      const resolution = resolveScope(link.item.scope, selection, itemId);
      if (link.create && resolution.satisfied) {
        router.push(
          actionHref({ mode: "create", operationId: link.create.operationId, params: resolution.params }),
        );
      }
    },
    [resourceId, row, router, selection, selectApplication, selectEnvironment],
  );
}
