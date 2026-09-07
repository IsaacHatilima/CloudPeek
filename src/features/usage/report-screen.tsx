/**
 * The Usage and Billing screens share one shape: organization scope, a token,
 * the `/usage` report, and a card of rows derived from it.
 */

import { USAGE_ENDPOINT } from "@/features/cloud-resources/catalog";
import { resolveScope } from "@/features/cloud-resources/scope";
import { useCloudConnection } from "@/features/connections/use-cloud-api";
import { ResourceSkeleton } from "@/features/resources/components/resource-skeleton";
import { ResourceList } from "@/features/resources/components/resource-list";
import { StateMessage } from "@/features/resources/components/state-message";
import {
  NotConnectedState,
  type ResourceDescriptor,
  ScopeRequiredState,
} from "@/features/resources/resource-states";
import { useResourceQuery } from "@/features/resources/use-resource-query";
import { useShellNavigation } from "@/features/shell/hooks/use-shell-navigation";
import { useWorkspaceSelection } from "@/features/workspace/use-workspace";
import { describeApiError } from "@/services/cloud-api/client";
import { useAppTheme } from "@/theme/use-app-theme";

import { KeyValueList } from "./components/key-value-list";
import type { KeyValueRow } from "./usage-presenters";

type ReportScreenProps = {
  descriptor: ResourceDescriptor;
  detail: string;
  rowsFrom: (report: unknown) => readonly KeyValueRow[];
};

export function ReportScreen({ descriptor, detail, rowsFrom }: ReportScreenProps) {
  const { colors } = useAppTheme();
  const selection = useWorkspaceSelection();
  const { openConnect, openResource, openScope } = useShellNavigation();
  const resolution = resolveScope("organization", selection);

  if (!resolution.satisfied) {
    return (
      <ScopeRequiredState
        colors={colors}
        descriptor={descriptor}
        missing={resolution.missing}
        onOpenResource={openResource}
        onOpenScope={openScope}
      />
    );
  }

  return (
    <ConnectedReport
      descriptor={descriptor}
      detail={detail}
      onConnect={openConnect}
      organizationName={selection.organization?.name ?? "the organization"}
      rowsFrom={rowsFrom}
    />
  );
}

function ConnectedReport({
  descriptor,
  detail,
  onConnect,
  organizationName,
  rowsFrom,
}: ReportScreenProps & { onConnect: () => void; organizationName: string }) {
  const { colors } = useAppTheme();
  const { api, isLoading: isLoadingToken } = useCloudConnection();
  const query = useResourceQuery(api, USAGE_ENDPOINT, {});

  if (isLoadingToken) return <ResourceSkeleton colors={colors} />;
  if (api === null) {
    return (
      <NotConnectedState
        colors={colors}
        descriptor={descriptor}
        detail={detail}
        endpoint={USAGE_ENDPOINT}
        onConnect={onConnect}
        organizationName={organizationName}
        params={{}}
      />
    );
  }
  if (query.isPending) return <ResourceSkeleton colors={colors} />;
  if (query.error && !query.data) {
    return (
      <StateMessage
        action={{ label: "Try again", onPress: () => void query.refetch() }}
        body={describeApiError(query.error)}
        colors={colors}
        icon={descriptor.icon}
        title={`Could not load ${descriptor.label.toLowerCase()}`}
      />
    );
  }

  const rows = rowsFrom(query.data);
  if (rows.length === 0) {
    return (
      <ResourceList
        colors={colors}
        error={null}
        isLoading={false}
        isRefetching={query.isRefetching}
        label={descriptor.label}
        onRefresh={() => void query.refetch()}
        rows={[]}
      />
    );
  }

  return <KeyValueList colors={colors} rows={rows} isRefetching={query.isRefetching} onRefresh={() => void query.refetch()} refreshFailed={Boolean(query.error)} />;
}
