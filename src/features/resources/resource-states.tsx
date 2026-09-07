import type { SymbolViewProps } from "expo-symbols";

import { findResource } from "@/features/cloud-resources/catalog";
import { describeMissingScope, PARENT_RESOURCE } from "@/features/cloud-resources/scope";
import type {
  CloudEndpoint,
  ResourceId,
  ResourceScope,
} from "@/features/cloud-resources/types";
import { isScopeLevel, type ScopeLevel } from "@/features/workspace/types";
import type { ColorPalette } from "@/theme/types";

import { StateMessage } from "./components/state-message";

/** What a state needs to know about the thing it stands in for. */
export type ResourceDescriptor = {
  icon: SymbolViewProps["name"];
  label: string;
};

const SCOPE_NOUN: Record<ResourceScope, string> = {
  application: "an application",
  bucket: "a bucket",
  databaseCluster: "a database cluster",
  environment: "an environment",
  instance: "an instance",
  organization: "an organization",
  websocketCluster: "a WebSocket cluster",
};

export function UnknownResourceState({
  colors,
  resource,
}: {
  colors: ColorPalette;
  resource: string;
}) {
  return (
    <StateMessage
      body={`"${resource}" is not a Laravel Cloud resource type Cloud Peek knows about.`}
      colors={colors}
      icon={{ ios: "questionmark.circle", android: "help", web: "help" }}
      title="No such resource"
    />
  );
}

/** Database Restores: the menu keeps it, Cloud has nothing to list. */
export function NoListEndpointState({
  colors,
  descriptor,
  note,
}: {
  colors: ColorPalette;
  descriptor: ResourceDescriptor;
  note?: string;
}) {
  return (
    <StateMessage
      body={note}
      colors={colors}
      icon={descriptor.icon}
      title={descriptor.label}
    />
  );
}

/**
 * The next thing to select: a shortcut to the scope sheet for organization,
 * application, and environment; for a parent picked on screen (an instance,
 * a cluster, a bucket), a shortcut to the parent's own list, where opening
 * one leads here.
 */
export function ScopeRequiredState({
  colors,
  descriptor,
  missing,
  onOpenResource,
  onOpenScope,
}: {
  colors: ColorPalette;
  descriptor: ResourceDescriptor;
  missing: ResourceScope;
  onOpenResource: (id: ResourceId) => void;
  onOpenScope: (level: ScopeLevel) => void;
}) {
  const noun = SCOPE_NOUN[missing];
  const parentId = PARENT_RESOURCE[missing];
  const parent = parentId ? findResource(parentId) : undefined;

  if (isScopeLevel(missing)) {
    return (
      <StateMessage
        action={{ label: describeMissingScope(missing), onPress: () => onOpenScope(missing) }}
        body={`Choose ${noun} to see its ${descriptor.label.toLowerCase()}.`}
        colors={colors}
        icon={descriptor.icon}
        title={describeMissingScope(missing)}
      />
    );
  }

  return (
    <StateMessage
      action={parent ? { label: `Open ${parent.label}`, onPress: () => onOpenResource(parent.id) } : undefined}
      body={`"${descriptor.label}" belongs to ${noun}. Open one from ${parent?.label ?? "its list"} and pick ${descriptor.label} there.`}
      colors={colors}
      icon={descriptor.icon}
      title={describeMissingScope(missing)}
    />
  );
}

/** Scope satisfied, but this organization has no stored token: nothing is sent. */
export function NotConnectedState({
  colors,
  descriptor,
  detail,
  onConnect,
  organizationName,
}: {
  colors: ColorPalette;
  descriptor: ResourceDescriptor;
  detail?: string;
  endpoint: CloudEndpoint;
  onConnect: () => void;
  organizationName: string;
  params: Record<string, string>;
}) {
  const body = `Connect ${organizationName} to view its ${descriptor.label.toLowerCase()}. Add its API token to continue.`;

  return (
    <StateMessage
      action={{ label: "Connect organization", onPress: onConnect }}
      body={detail ? `${body} ${detail}` : body}
      colors={colors}
      icon={{ ios: "cloud", android: "cloud_off", web: "cloud_off" }}
      title="Reconnect your organization"
    />
  );
}
