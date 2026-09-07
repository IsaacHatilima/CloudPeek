import type { SymbolViewProps } from "expo-symbols";

/**
 * What must be selected before a resource can be requested from Cloud.
 * The first three come from the workspace store; the last four need a parent
 * resource chosen on the screen itself (an instance, a cluster, a bucket).
 */
export type ResourceScope =
  | "application"
  | "bucket"
  | "databaseCluster"
  | "environment"
  | "instance"
  | "organization"
  | "websocketCluster";

export type ResourceId =
  | "applications"
  | "background-processes"
  | "billing"
  | "bucket-keys"
  | "caches"
  | "commands"
  | "database-clusters"
  | "database-restores"
  | "database-snapshots"
  | "databases"
  | "dedicated-clusters"
  | "deployments"
  | "domains"
  | "edge-networks"
  | "environment-logs"
  | "environments"
  | "instances"
  | "object-storage-buckets"
  | "organization"
  | "regions"
  | "secrets"
  | "usage"
  | "websocket-applications"
  | "websocket-clusters";

/**
 * Response envelope, as documented in Cloud's OpenAPI spec:
 * - "collection": paginated JSON:API (`data[]`, `links`, `meta` paginator).
 * - "list": a plain `data[]` with no paginator (regions; logs add cursor `meta`).
 * - "single": one JSON:API resource (`data` with `id` and `type`).
 * - "report": a `data` object that is not a JSON:API resource (usage).
 */
export type CloudEndpointKind = "collection" | "list" | "report" | "single";

export type CloudEndpoint = {
  /** Query params the endpoint needs even for a plain listing (e.g. a log time window). */
  defaultQuery?: () => Record<string, string>;
  kind: CloudEndpointKind;
  method: "GET";
  /** Cloud's own operationId, for cross-referencing the OpenAPI spec. */
  operationId: string;
  /** Path placeholders in order, using Cloud's parameter names verbatim. */
  params: readonly string[];
  path: string;
};

export type ResourceMenuItem = {
  /** `null` when Cloud documents no list endpoint; `note` then explains. */
  endpoint: CloudEndpoint | null;
  icon: SymbolViewProps["name"];
  id: ResourceId;
  label: string;
  note?: string;
  scope: ResourceScope;
};

export type ResourceMenuSection = {
  id: string;
  items: readonly ResourceMenuItem[];
  title: string;
};
