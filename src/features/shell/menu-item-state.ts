import {
  describeMissingScope,
  resolveScope,
} from "@/features/cloud-resources/scope";
import type { ResourceMenuItem } from "@/features/cloud-resources/types";
import type { WorkspaceSelection } from "@/features/workspace/types";

export type MenuItemState = { caption?: string; dimmed: boolean };

export const NO_LIST_ENDPOINT_CAPTION = "No list endpoint in Cloud's API";

/**
 * How a menu row reads for the current selection: dimmed whenever it cannot
 * list yet, with a caption saying why. The one requirement every row shares,
 * an organization, is left to the dock underneath rather than repeated on
 * two dozen rows.
 */
export function menuItemState(
  item: ResourceMenuItem,
  selection: WorkspaceSelection,
): MenuItemState {
  if (!item.endpoint) return { caption: NO_LIST_ENDPOINT_CAPTION, dimmed: true };

  const resolution = resolveScope(item.scope, selection);
  if (resolution.satisfied) return { dimmed: false };

  return {
    caption:
      resolution.missing === "organization"
        ? undefined
        : describeMissingScope(resolution.missing),
    dimmed: true,
  };
}
