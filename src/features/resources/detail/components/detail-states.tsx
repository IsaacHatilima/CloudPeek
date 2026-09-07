
import type { CloudEndpoint, ResourceMenuItem } from "@/features/cloud-resources/types";
import { describeApiError } from "@/services/cloud-api/client";
import type { ColorPalette } from "@/theme/types";

import { ResourceSkeleton } from "../../components/resource-skeleton";
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
        <StateMessage
          action={{ label: "Try again", onPress: state.refetch }}
          body={describeApiError(state.error)}
          colors={colors}
          icon={{ ios: "exclamationmark.triangle", android: "warning", web: "warning" }}
          title={`Could not load this ${item.label.toLowerCase()}`}
        />
      );
    case "missing":
      return (
        <StateMessage
          action={{ label: "Refresh", onPress: state.refetch }}
          body="It is not in the list Laravel Cloud returned. It may have been deleted, or it is past the first page."
          colors={colors}
          icon={item.icon}
          title="Not found"
        />
      );
  }
}
