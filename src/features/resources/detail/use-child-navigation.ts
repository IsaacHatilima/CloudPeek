import { useRouter } from "expo-router";
import { useCallback } from "react";

import { actionHref } from "@/features/actions/action-route";
import { resolveScope } from "@/features/cloud-resources/scope";
import { childListPath } from "@/features/shell/resource-navigation";
import { useWorkspaceSelection } from "@/features/workspace/use-workspace";

import type { ChildLink } from "./detail-model";

/**
 * Opens a child of the current item: its list, scoped to this item as the
 * parent, or straight into the create form when the child has no list
 * (a cluster's restore).
 */
export function useChildNavigation(itemId: string) {
  const router = useRouter();
  const selection = useWorkspaceSelection();

  return useCallback(
    (link: ChildLink) => {
      if (link.listable) {
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
    [itemId, router, selection],
  );
}
