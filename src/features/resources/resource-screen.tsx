/**
 * Shared resource content used by the named feature screens.
 *
 * States, in the order they are checked: unknown id, no connections, custom
 * content (organization, usage, billing), scope not yet selected, create-only resource,
 * no token for the organization, and then the fetched list (loading, failed,
 * empty, or rows).
 */
import { useMemo, type ReactNode } from "react";
import { StyleSheet, View } from "react-native";

import { FloatingActionButton } from "@/components/floating-action-button";
import { findResource } from "@/features/cloud-resources/catalog";
import { resolveScope } from "@/features/cloud-resources/scope";
import type { CloudEndpoint, ResourceMenuItem } from "@/features/cloud-resources/types";
import { useCloudConnection } from "@/features/connections/use-cloud-api";
import { useShellNavigation } from "@/features/shell/hooks/use-shell-navigation";
import { useConnectedOrganizations, useWorkspaceSelection } from "@/features/workspace/use-workspace";
import { useAppTheme } from "@/theme/use-app-theme";

import { WelcomePanel } from "@/features/connections/components/welcome-panel";
import { ResourceSkeleton } from "./components/resource-skeleton";

import { ResourceList } from "./components/resource-list";
import { StateMessage } from "./components/state-message";
import { presentRows } from "./presenters";
import {
  NotConnectedState,
  ScopeRequiredState,
  UnknownResourceState,
} from "./resource-states";
import { useListNavigation } from "./use-list-navigation";
import { useResourceListQuery } from "./use-resource-list-query";

export type ResourceFeatureProps = {
  /** The parent chosen on screen for instance, cluster, and bucket scopes. */
  parentId?: string;
};

type ResourceScreenProps = ResourceFeatureProps & {
  /** Reports and device-local resources supply their own content. */
  children?: ReactNode;
  resourceId: string;
};

export function ResourceScreen({ children, parentId, resourceId }: ResourceScreenProps) {
  const { colors } = useAppTheme();
  const selection = useWorkspaceSelection();
  const organizations = useConnectedOrganizations();
  const { openConnect, openResource, openScope } = useShellNavigation();
  const item = findResource(resourceId);

  if (!item) return <UnknownResourceState colors={colors} resource={resourceId} />;
  if (organizations.length === 0) return <WelcomePanel colors={colors} onConnect={openConnect} />;
  if (children !== undefined) return children;
  const resolution = resolveScope(item.scope, selection, parentId);
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

  if (!item.endpoint) {
    return <CreateOnlyResource item={item} params={resolution.params} parentId={parentId} />;
  }

  return (
    <ConnectedResourceList
      endpoint={item.endpoint}
      item={item}
      onConnect={openConnect}
      organizationName={selection.organization?.name ?? "the organization"}
      params={resolution.params}
      parentId={parentId}
    />
  );
}

function CreateOnlyResource({ item, params, parentId }: { item: ResourceMenuItem; params: Record<string, string>; parentId?: string }) {
  const { colors } = useAppTheme();
  const { create, openCreate } = useListNavigation(item, params, parentId);
  return <StateMessage colors={colors} icon={item.icon} title={item.label} body={item.note}
    action={create ? { label: create.summary, onPress: openCreate } : undefined} />;
}

function ConnectedResourceList({
  endpoint,
  item,
  onConnect,
  organizationName,
  params,
  parentId,
}: {
  endpoint: CloudEndpoint;
  item: ResourceMenuItem;
  onConnect: () => void;
  organizationName: string;
  params: Record<string, string>;
  parentId?: string;
}) {
  const { colors } = useAppTheme();
  const { api, isLoading: isLoadingToken } = useCloudConnection();
  const query = useResourceListQuery(api, endpoint, params);
  const rows = useMemo(() => presentRows(query.data), [query.data]);
  const { create, openCreate, openItem } = useListNavigation(item, params, parentId);

  if (isLoadingToken) return <ResourceSkeleton colors={colors} />;

  if (api === null) {
    return (
      <NotConnectedState
        colors={colors}
        descriptor={item}
        endpoint={endpoint}
        onConnect={onConnect}
        organizationName={organizationName}
        params={params}
      />
    );
  }

  return (
    <View style={styles.root}>
      <ResourceList
        colors={colors}
        error={query.error}
        hasFloatingAction={create !== null}
        icon={item.icon}
        isLoading={query.isPending}
        isRefetching={query.isRefetching}
        hasNextPage={query.hasNextPage}
        isLoadingMore={query.isFetchingNextPage}
        loadMoreFailed={query.isFetchNextPageError}
        onLoadMore={() => void query.fetchNextPage()}
        total={typeof query.data?.meta?.total === "number" ? query.data.meta.total : undefined}
        label={item.label}
        onPressRow={openItem}
        onConnect={onConnect}
        onRefresh={() => void query.refetch()}
        rows={rows}
      />
      {create ? (
        <FloatingActionButton
          accessibilityLabel={create.summary}
          colors={colors}
          icon={{ ios: "plus", android: "add", web: "add" }}
          onPress={openCreate}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
