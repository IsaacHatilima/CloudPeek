/**
 * The screen behind every side-menu item, also reused by the Usage tab.
 *
 * States, in the order they are checked: unknown id, a screen of its own
 * (organizations, usage, billing), no list endpoint, scope not yet selected,
 * no token for the organization, and then the fetched list (loading, failed,
 * empty, or rows).
 */
import { useMemo } from "react";
import { StyleSheet, View } from "react-native";

import { FloatingActionButton } from "@/components/floating-action-button";
import { BillingScreen } from "@/features/billing/billing-screen";
import { findResource } from "@/features/cloud-resources/catalog";
import { resolveScope } from "@/features/cloud-resources/scope";
import type { CloudEndpoint, ResourceMenuItem } from "@/features/cloud-resources/types";
import { OrganizationsScreen } from "@/features/connections/organizations-screen";
import { useCloudConnection } from "@/features/connections/use-cloud-api";
import { useShellNavigation } from "@/features/shell/hooks/use-shell-navigation";
import { UsageScreen } from "@/features/usage/usage-screen";
import { useConnectedOrganizations, useWorkspaceSelection } from "@/features/workspace/use-workspace";
import { useAppTheme } from "@/theme/use-app-theme";

import { WelcomePanel } from "@/features/connections/components/welcome-panel";
import { ResourceSkeleton } from "./components/resource-skeleton";

import { ResourceList } from "./components/resource-list";
import { presentRows } from "./presenters";
import {
  NoListEndpointState,
  NotConnectedState,
  ScopeRequiredState,
  UnknownResourceState,
} from "./resource-states";
import { useListNavigation } from "./use-list-navigation";
import { useResourceQuery } from "./use-resource-query";

type ResourceScreenProps = {
  /** The parent chosen on screen for instance, cluster, and bucket scopes. */
  parentId?: string;
  resourceId: string;
};

export function ResourceScreen({ parentId, resourceId }: ResourceScreenProps) {
  const { colors } = useAppTheme();
  const selection = useWorkspaceSelection();
  const organizations = useConnectedOrganizations();
  const { openConnect, openResource, openScope } = useShellNavigation();
  const item = findResource(resourceId);

  if (!item) return <UnknownResourceState colors={colors} resource={resourceId} />;
  if (organizations.length === 0) return <WelcomePanel colors={colors} onConnect={openConnect} />;
  // Organizations are connected on this device, not listed by the API.
  if (item.id === "organization") return <OrganizationsScreen />;
  // Usage and Billing are two readings of one report, not lists.
  if (item.id === "usage") return <UsageScreen />;
  if (item.id === "billing") return <BillingScreen />;
  if (!item.endpoint) {
    return <NoListEndpointState colors={colors} descriptor={item} note={item.note} />;
  }

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
  const query = useResourceQuery(api, endpoint, params);
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
        label={item.label}
        onPressRow={openItem}
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
