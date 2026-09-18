
import type { CloudEndpoint, ResourceMenuItem } from "@/features/cloud-resources/types";
import type { ColorPalette } from "@/theme/types";

import { ResourceSkeleton } from "../../components/resource-skeleton";
import { ApiErrorState } from "../../components/api-error-state";
import { StateMessage } from "../../components/state-message";
import { NotConnectedState } from "../../resource-states";
import type { ResourceItemState } from "../use-resource-item";

type DetailStateProps = {
  colors: ColorPalette;
  endpoint: CloudEndpoint;
  item: ResourceMenuItem;
  onConnect: () => void;
  organizationName: string;
  scopeParams: Record<string, string>;
  state: Exclude<ResourceItemState, { kind: "ready" }>;
};

/** Everything a detail screen shows before it has its item: loading, no token, failed, gone. */
export function DetailState({
  colors,
  endpoint,
  item,
  onConnect,
  organizationName,
  scopeParams,
  state,
}: DetailStateProps) {
  switch (state.kind) {
    case "loading":
      return <ResourceSkeleton colors={colors} />;
    case "not-connected":
      return (
        <NotConnectedState
          colors={colors}
          descriptor={item}
          endpoint={endpoint}
          onConnect={onConnect}
          organizationName={organizationName}
          params={scopeParams}
        />
      );
    case "error":
      return (
        <ApiErrorState
          onRetry={state.refetch}
          onConnect={onConnect}
          error={state.error}
          colors={colors}
          title={`Could not load this ${item.label.toLowerCase()}`}
        />
      );
    case "missing":
      return (
        <StateMessage
          action={{ label: "Refresh", onPress: state.refetch }}
          body="Laravel Cloud could not find this item. It may have been deleted or become unavailable to this organization."
          colors={colors}
          icon={item.icon}
          title="Not found"
        />
      );
  }
}
