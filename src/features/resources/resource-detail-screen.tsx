/**
 * `/resources/[resource]/[id]`: one item, read from the same cached list its
 * row came from, with its attributes, related lists, and write actions.
 * Parent-scoped resources carry the parent's id in `?parent=`.
 */
import { useLocalSearchParams } from "expo-router";

import { findResource } from "@/features/cloud-resources/catalog";
import { resolveScope } from "@/features/cloud-resources/scope";
import type { CloudEndpoint, ResourceMenuItem } from "@/features/cloud-resources/types";
import { useShellNavigation } from "@/features/shell/hooks/use-shell-navigation";
import { useWorkspaceSelection } from "@/features/workspace/use-workspace";
import { useAppTheme } from "@/theme/use-app-theme";
import type { ColorPalette } from "@/theme/types";

import { DetailState } from "./detail/components/detail-states";
import { DetailView } from "./detail/components/detail-view";
import { useResourceItem } from "./detail/use-resource-item";
import { ScopeRequiredState, UnknownResourceState } from "./resource-states";

function param(value: string | string[] | undefined): string | undefined {
  return typeof value === "string" && value !== "" ? value : undefined;
}

export function ResourceDetailScreen() {
  const { id, parent, resource } = useLocalSearchParams<{ id?: string; parent?: string; resource?: string }>();
  const { colors } = useAppTheme();
  const selection = useWorkspaceSelection();
  const { openResource, openScope } = useShellNavigation();
  const resourceId = param(resource) ?? "";
  const itemId = param(id) ?? "";
  const item = findResource(resourceId);

  if (!item || !item.endpoint || itemId === "") {
    return <UnknownResourceState colors={colors} resource={resourceId || "item"} />;
  }

  const resolution = resolveScope(item.scope, selection, param(parent));
  if (!resolution.satisfied) {
    return (
      <ScopeRequiredState
        colors={colors}
        descriptor={item}
        missing={resolution.missing}
        onOpenResource={openResource}
        onOpenScope={openScope}
      />
    );
  }

  return (
    <ConnectedDetail
      colors={colors}
      endpoint={item.endpoint}
      item={item}
      itemId={itemId}
      parentId={param(parent)}
      scopeParams={resolution.params}
    />
  );
}

function ConnectedDetail({
  colors,
  endpoint,
  item,
  itemId,
  parentId,
  scopeParams,
}: {
  colors: ColorPalette;
  endpoint: CloudEndpoint;
  item: ResourceMenuItem;
  itemId: string;
  parentId?: string;
  scopeParams: Record<string, string>;
}) {
  const state = useResourceItem(endpoint, scopeParams, itemId);
  const selection = useWorkspaceSelection();
  const { openConnect } = useShellNavigation();

  if (state.kind !== "ready") {
    return (
      <DetailState
        colors={colors}
        endpoint={endpoint}
        item={item}
        onConnect={openConnect}
        organizationName={selection.organization?.name ?? "the organization"}
        scopeParams={scopeParams}
        state={state}
      />
    );
  }

  return (
    <DetailView
      attributes={state.attributes}
      colors={colors}
      isRefetching={state.isRefetching}
      item={item}
      itemId={itemId}
      onRefresh={state.refetch}
      parentId={parentId}
      row={state.row}
      scopeParams={scopeParams}
    />
  );
}
