/**
 * The side menu, section by section, mapped to the Laravel Cloud API.
 *
 * Every `path`, `params` list, and `operationId` was confirmed against the
 * OpenAPI document at https://cloud.laravel.com/api-docs/api.json on
 * 2026-09-05. Nothing is guessed: where Cloud has no list endpoint (database
 * restores) the item carries `endpoint: null` and a note instead of an
 * invented path. `__tests__/cloud-resources/catalog.test.ts` pins the shape.
 *
 * Response shapes come from the same document: `collection` endpoints return
 * paginated JSON:API (`data[]`, `links`, `meta`), `list` endpoints return a
 * plain `data[]` (regions; logs add cursor `meta`), `single` returns one
 * JSON:API resource, and `report` returns a `data` object (usage).
 */
import { logWindow } from "./log-window";
import type {
  CloudEndpoint,
  ResourceId,
  ResourceMenuItem,
  ResourceMenuSection,
} from "./types";

function collection(
  path: string,
  operationId: string,
  params: readonly string[] = [],
): CloudEndpoint {
  return { kind: "collection", method: "GET", operationId, params, path };
}

function single(path: string, operationId: string): CloudEndpoint {
  return { kind: "single", method: "GET", operationId, params: [], path };
}

function list(
  path: string,
  operationId: string,
  params: readonly string[] = [],
): CloudEndpoint {
  return { kind: "list", method: "GET", operationId, params, path };
}

function report(
  path: string,
  operationId: string,
  params: readonly string[] = [],
): CloudEndpoint {
  return { kind: "report", method: "GET", operationId, params, path };
}

/** Billing and usage share one report; the Billing screen reads its `summary`. */
export const USAGE_ENDPOINT: CloudEndpoint = report("/usage", "public.usage");

export const RESOURCE_MENU: readonly ResourceMenuSection[] = [
  {
    id: "overview",
    title: "Overview",
    items: [
      {
        id: "applications",
        label: "Applications",
        scope: "organization",
        icon: { ios: "square.grid.2x2", android: "apps", web: "apps" },
        // Applications have no status of their own; their environments do, and
        // `include=environments` returns them in the same answer.
        endpoint: {
          ...collection("/applications", "public.applications.index"),
          defaultQuery: () => ({ include: "environments" }),
        },
      },
      {
        id: "environments",
        label: "Environments",
        scope: "application",
        icon: { ios: "square.stack.3d.up", android: "layers", web: "layers" },
        endpoint: collection(
          "/applications/{application}/environments",
          "public.applications.environments.index",
          ["application"],
        ),
      },
      {
        id: "usage",
        label: "Usage",
        scope: "organization",
        icon: { ios: "chart.bar", android: "bar_chart", web: "bar_chart" },
        endpoint: USAGE_ENDPOINT,
      },
      {
        id: "billing",
        label: "Billing",
        scope: "organization",
        icon: { ios: "creditcard", android: "credit_card", web: "credit_card" },
        // Cloud has no billing endpoint: spend, credits, and the spending alert
        // are the `summary` of the usage report.
        endpoint: USAGE_ENDPOINT,
      },
    ],
  },
  {
    id: "deploy",
    title: "Deploy",
    items: [
      {
        id: "deployments",
        label: "Deployments",
        scope: "environment",
        icon: {
          ios: "shippingbox",
          android: "rocket_launch",
          web: "rocket_launch",
        },
        endpoint: collection(
          "/environments/{environment}/deployments",
          "public.environments.deployments.index",
          ["environment"],
        ),
      },
      {
        id: "commands",
        label: "Commands",
        scope: "environment",
        icon: { ios: "terminal", android: "terminal", web: "terminal" },
        endpoint: collection(
          "/environments/{environment}/commands",
          "public.environments.commands.index",
          ["environment"],
        ),
      },
      {
        id: "instances",
        label: "Instances",
        scope: "environment",
        icon: { ios: "server.rack", android: "dns", web: "dns" },
        endpoint: collection(
          "/environments/{environment}/instances",
          "public.environments.instances.index",
          ["environment"],
        ),
      },
      {
        id: "background-processes",
        label: "Background Processes",
        scope: "instance",
        icon: {
          ios: "arrow.triangle.2.circlepath",
          android: "sync",
          web: "sync",
        },
        endpoint: collection(
          "/instances/{instance}/background-processes",
          "public.instances.background-processes.index",
          ["instance"],
        ),
      },
      {
        id: "environment-logs",
        label: "Logs",
        scope: "environment",
        icon: {
          ios: "doc.text.magnifyingglass",
          android: "receipt_long",
          web: "receipt_long",
        },
        endpoint: {
          ...list(
            "/environments/{environment}/logs",
            "public.environments.logs.index",
            ["environment"],
          ),
          defaultQuery: logWindow,
        },
      },
    ],
  },
  {
    id: "data",
    title: "Data",
    items: [
      {
        id: "database-clusters",
        label: "Database Clusters",
        scope: "organization",
        icon: {
          ios: "cylinder.split.1x2",
          android: "database",
          web: "database",
        },
        endpoint: collection(
          "/databases/clusters",
          "public.databases.clusters.index",
        ),
      },
      {
        id: "databases",
        label: "Databases",
        scope: "databaseCluster",
        icon: { ios: "cylinder", android: "storage", web: "storage" },
        endpoint: collection(
          "/databases/clusters/{database}/databases",
          "public.databases.clusters.databases.index",
          ["database"],
        ),
      },
      {
        id: "database-snapshots",
        label: "Database Snapshots",
        scope: "databaseCluster",
        icon: {
          ios: "clock.arrow.circlepath",
          android: "history",
          web: "history",
        },
        endpoint: collection(
          "/databases/clusters/{database}/snapshots",
          "public.databases.clusters.snapshots.index",
          ["database"],
        ),
      },
      {
        id: "database-restores",
        label: "Database Restores",
        scope: "databaseCluster",
        icon: {
          ios: "arrow.counterclockwise.circle",
          android: "settings_backup_restore",
          web: "settings_backup_restore",
        },
        endpoint: null,
        note: "Laravel Cloud has no list endpoint for restores. The API only exposes POST /databases/clusters/{database}/restore, which creates a new database from a snapshot or a point in time (confirmed against the OpenAPI spec on 2026-09-05).",
      },
    ],
  },
  {
    id: "storage",
    title: "Storage & Cache",
    items: [
      {
        id: "object-storage-buckets",
        label: "Object Storage Buckets",
        scope: "organization",
        icon: { ios: "archivebox", android: "inventory_2", web: "inventory_2" },
        endpoint: collection("/buckets", "public.buckets.index"),
      },
      {
        id: "bucket-keys",
        label: "Bucket Keys",
        scope: "bucket",
        icon: { ios: "key", android: "key", web: "key" },
        endpoint: collection(
          "/buckets/{filesystem}/keys",
          "public.buckets.keys.index",
          ["filesystem"],
        ),
      },
      {
        id: "caches",
        label: "Caches",
        scope: "organization",
        icon: { ios: "bolt", android: "bolt", web: "bolt" },
        endpoint: collection("/caches", "public.caches.index"),
      },
    ],
  },
  {
    id: "network",
    title: "Network",
    items: [
      {
        id: "domains",
        label: "Domains",
        scope: "environment",
        icon: { ios: "globe", android: "language", web: "language" },
        endpoint: collection(
          "/environments/{environment}/domains",
          "public.environments.domains.index",
          ["environment"],
        ),
      },
      {
        id: "edge-networks",
        label: "Edge Networks",
        scope: "organization",
        icon: { ios: "network", android: "hub", web: "hub" },
        endpoint: collection("/edge-networks", "public.edge-networks.index"),
      },
      {
        id: "dedicated-clusters",
        label: "Dedicated Clusters",
        scope: "organization",
        icon: { ios: "rectangle.3.group", android: "grid_view", web: "grid_view" },
        endpoint: collection(
          "/dedicated-clusters",
          "public.dedicated-clusters.index",
        ),
      },
    ],
  },
  {
    id: "realtime",
    title: "Realtime",
    items: [
      {
        id: "websocket-clusters",
        label: "WebSocket Clusters",
        scope: "organization",
        icon: {
          ios: "antenna.radiowaves.left.and.right",
          android: "cell_tower",
          web: "cell_tower",
        },
        endpoint: collection(
          "/websocket-servers",
          "public.websocket-servers.index",
        ),
      },
      {
        id: "websocket-applications",
        label: "WebSocket Applications",
        scope: "websocketCluster",
        icon: {
          ios: "dot.radiowaves.left.and.right",
          android: "sensors",
          web: "sensors",
        },
        endpoint: collection(
          "/websocket-servers/{websocketServer}/applications",
          "public.websocket-servers.applications.index",
          ["websocketServer"],
        ),
      },
    ],
  },
  {
    id: "account",
    title: "Account",
    items: [
      {
        id: "secrets",
        label: "Secrets",
        scope: "organization",
        icon: { ios: "lock.shield", android: "lock", web: "lock" },
        endpoint: collection("/secrets", "public.secrets.index"),
      },
      {
        id: "organization",
        label: "Organization",
        scope: "organization",
        icon: {
          ios: "building.2",
          android: "corporate_fare",
          web: "corporate_fare",
        },
        endpoint: single("/meta/organization", "public.meta.organization"),
      },
      {
        id: "regions",
        label: "Regions",
        scope: "organization",
        icon: { ios: "map", android: "public", web: "public" },
        endpoint: list("/meta/regions", "public.meta.regions"),
      },
    ],
  },
];

export const ALL_RESOURCES: readonly ResourceMenuItem[] = RESOURCE_MENU.flatMap(
  (section) => section.items,
);

export function findResource(id: string): ResourceMenuItem | undefined {
  return ALL_RESOURCES.find((item) => item.id === id);
}

export function isResourceId(value: string): value is ResourceId {
  return findResource(value) !== undefined;
}
