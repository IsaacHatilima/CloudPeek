/**
 * Which of Cloud's write operations belong to which side-menu resource.
 *
 * `WRITE_TARGETS` is the only hand-written part: for each resource, the path
 * new items are POSTed to and the path of one item. Everything else is derived
 * from the generated operation list, so a refreshed contract flows through
 * without edits here: the POST on `createPath` is the create action, the
 * PATCH/PUT and DELETE on `itemPath` are update and delete, and any remaining
 * operation under `itemPath/…` (start, stop, verify, avatar…) is a command of
 * that resource. `__tests__/actions/action-catalog.test.ts` checks that every
 * generated operation lands in exactly one place.
 */
import type { ResourceId } from "@/features/cloud-resources/types";
import type { WriteOperation } from "@/services/cloud-api/operation-types";
import { WRITE_OPERATIONS } from "@/services/cloud-api/write-operations.generated";

export type WriteTarget = {
  /** Where new items are POSTed; null when Cloud has no create route. */
  createPath: string | null;
  /** One item's path, e.g. `/applications/{application}`; null without item routes. */
  itemPath: string | null;
};

export const WRITE_TARGETS: Readonly<Partial<Record<ResourceId, WriteTarget>>> = {
  applications: { createPath: "/applications", itemPath: "/applications/{application}" },
  "background-processes": {
    createPath: "/instances/{instance}/background-processes",
    itemPath: "/background-processes/{backgroundProcess}",
  },
  "bucket-keys": {
    createPath: "/buckets/{filesystem}/keys",
    itemPath: "/bucket-keys/{filesystemKey}",
  },
  caches: { createPath: "/caches", itemPath: "/caches/{cache}" },
  commands: { createPath: "/environments/{environment}/commands", itemPath: null },
  "database-clusters": {
    createPath: "/databases/clusters",
    itemPath: "/databases/clusters/{database}",
  },
  "database-restores": {
    createPath: "/databases/clusters/{database}/restore",
    itemPath: null,
  },
  "database-snapshots": {
    createPath: "/databases/clusters/{database}/snapshots",
    itemPath: "/database-snapshots/{databaseSnapshot}",
  },
  databases: {
    createPath: "/databases/clusters/{database}/databases",
    itemPath: "/databases/clusters/{database}/databases/{schema}",
  },
  deployments: { createPath: "/environments/{environment}/deployments", itemPath: null },
  domains: { createPath: "/environments/{environment}/domains", itemPath: "/domains/{domain}" },
  environments: {
    createPath: "/applications/{application}/environments",
    itemPath: "/environments/{environment}",
  },
  instances: {
    createPath: "/environments/{environment}/instances",
    itemPath: "/instances/{instance}",
  },
  "object-storage-buckets": { createPath: "/buckets", itemPath: "/buckets/{filesystem}" },
  secrets: { createPath: "/secrets", itemPath: "/secrets/{secret}" },
  "websocket-applications": {
    createPath: "/websocket-servers/{websocketServer}/applications",
    itemPath: "/websocket-applications/{websocketApplication}",
  },
  "websocket-clusters": {
    createPath: "/websocket-servers",
    itemPath: "/websocket-servers/{websocketServer}",
  },
};

export type ResourceActions = {
  /** Operations on one item beyond update and delete: start, stop, verify, avatar… */
  commands: readonly WriteOperation[];
  create: WriteOperation | null;
  /** The path parameter carrying one item's id (`application`, `schema`…); null without item routes. */
  idParam: string | null;
  remove: WriteOperation | null;
  update: WriteOperation | null;
};

const NO_ACTIONS: ResourceActions = {
  commands: [],
  create: null,
  idParam: null,
  remove: null,
  update: null,
};

type TargetEntry = readonly [ResourceId, WriteTarget];

function lastParam(path: string | null): string | null {
  const params = path?.match(/\{([^}]+)\}/g);
  return params ? params[params.length - 1].slice(1, -1) : null;
}

function operationAt(path: string | null, methods: readonly string[]): WriteOperation | null {
  if (!path) return null;
  return WRITE_OPERATIONS.find((op) => op.path === path && methods.includes(op.method)) ?? null;
}

function ownedActions(target: WriteTarget): Omit<ResourceActions, "commands"> {
  return {
    create: operationAt(target.createPath, ["POST"]),
    idParam: lastParam(target.itemPath),
    remove: operationAt(target.itemPath, ["DELETE"]),
    update: operationAt(target.itemPath, ["PATCH", "PUT"]),
  };
}

/** The resource whose item path is the longest prefix of the operation's path. */
function commandOwner(op: WriteOperation, targets: readonly TargetEntry[]): ResourceId | null {
  const owner = targets
    .filter(([, target]) => target.itemPath !== null && op.path.startsWith(`${target.itemPath}/`))
    .sort((a, b) => (b[1].itemPath?.length ?? 0) - (a[1].itemPath?.length ?? 0))[0];
  return owner ? owner[0] : null;
}

function buildCatalog(): ReadonlyMap<ResourceId, ResourceActions> {
  const targets = Object.entries(WRITE_TARGETS) as TargetEntry[];
  const owned = targets.map(([id, target]) => [id, ownedActions(target)] as const);
  const claimed = new Set(
    owned.flatMap(([, actions]) =>
      [actions.create, actions.update, actions.remove].flatMap((op) => (op ? [op.operationId] : [])),
    ),
  );
  const commands = WRITE_OPERATIONS.filter((op) => !claimed.has(op.operationId)).flatMap((op) => {
    const owner = commandOwner(op, targets);
    return owner ? [[owner, op] as const] : [];
  });

  return new Map(
    owned.map(([id, actions]) => [
      id,
      { ...actions, commands: commands.filter(([owner]) => owner === id).map(([, op]) => op) },
    ]),
  );
}

const CATALOG = buildCatalog();

export function resourceActions(resourceId: string): ResourceActions {
  return CATALOG.get(resourceId as ResourceId) ?? NO_ACTIONS;
}

/** Every operation the catalog places somewhere; the test compares it with the generated list. */
export function claimedOperations(): readonly WriteOperation[] {
  return [...CATALOG.values()].flatMap((actions) =>
    [actions.create, actions.update, actions.remove, ...actions.commands].filter(
      (op): op is WriteOperation => op !== null,
    ),
  );
}

/** Deletes and purges: confirmed with a destructive prompt and drawn in red. */
export function isDestructive(op: WriteOperation): boolean {
  return op.method === "DELETE" || /\b(delete|purge)\b/i.test(op.summary);
}

/** Path placeholders the current scope does not fill; the form asks for them. */
export function missingParams(
  op: WriteOperation,
  params: Readonly<Record<string, string>>,
): readonly string[] {
  return op.params.filter((param) => !(param in params));
}

/** True when the user must fill something in first; false means a confirmation is enough. */
export function needsInput(op: WriteOperation, params: Readonly<Record<string, string>>): boolean {
  return (
    (op.body?.fields.length ?? 0) > 0 ||
    op.query.length > 0 ||
    missingParams(op, params).length > 0
  );
}
