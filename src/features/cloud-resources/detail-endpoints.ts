import type { CloudEndpoint } from "./types";

function single(path: string, operationId: string): CloudEndpoint {
  return { kind: "single", method: "GET", operationId, params: [...path.matchAll(/\{([^}]+)\}/g)].map((match) => match[1]), path };
}

/** Documented item reads, keyed by their list operation. Some resources only have a list. */
export const DETAIL_ENDPOINTS: Readonly<Record<string, CloudEndpoint>> = {
  "public.applications.index": { ...single("/applications/{application}", "public.applications.show"), defaultQuery: () => ({ include: "environments" }) },
  "public.instances.background-processes.index": single("/background-processes/{backgroundProcess}", "public.background-processes.show"),
  "public.buckets.keys.index": single("/bucket-keys/{filesystemKey}", "public.bucket-keys.show"),
  "public.caches.index": single("/caches/{cache}", "public.caches.show"),
  "public.environments.commands.index": single("/commands/{command}", "public.commands.show"),
  "public.databases.clusters.index": single("/databases/clusters/{database}", "public.databases.clusters.show"),
  "public.databases.clusters.snapshots.index": single("/database-snapshots/{databaseSnapshot}", "public.database-snapshots.show"),
  "public.databases.clusters.databases.index": single("/databases/clusters/{database}/databases/{schema}", "public.databases.clusters.databases.show"),
  "public.environments.deployments.index": single("/deployments/{deployment}", "public.deployments.show"),
  "public.environments.domains.index": single("/domains/{domain}", "public.domains.show"),
  "public.applications.environments.index": single("/environments/{environment}", "public.environments.show"),
  "public.environments.instances.index": single("/instances/{instance}", "public.instances.show"),
  "public.buckets.index": single("/buckets/{filesystem}", "public.buckets.show"),
  "public.websocket-servers.applications.index": single("/websocket-applications/{websocketApplication}", "public.websocket-applications.show"),
  "public.websocket-servers.index": single("/websocket-servers/{websocketServer}", "public.websocket-servers.show"),
};

export function detailRequest(list: CloudEndpoint, scopeParams: Record<string, string>, itemId: string) {
  const endpoint = DETAIL_ENDPOINTS[list.operationId];
  if (!endpoint) return null;
  const idParam = endpoint.params[endpoint.params.length - 1];
  const values = { ...scopeParams, [idParam]: itemId };
  return { endpoint, params: Object.fromEntries(endpoint.params.map((key) => [key, values[key]])) };
}
