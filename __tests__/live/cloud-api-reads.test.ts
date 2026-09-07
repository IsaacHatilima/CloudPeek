/**
 * Live reads against Laravel Cloud with a view-only token. Runs only when
 * CLOUD_API_TEST_TOKEN is set:
 *
 *   CLOUD_API_TEST_TOKEN=... pnpm run test __tests__/live
 *
 * Read endpoints only: nothing here creates, changes, or deletes anything.
 * Parent-scoped lists (databases, keys, WebSocket applications, background
 * processes) run against the first parent Cloud returns and report when there
 * is none.
 */
import { findResource } from "@/features/cloud-resources/catalog";
import type { ResourceId } from "@/features/cloud-resources/types";
import { organizationRefFrom } from "@/features/connections/connect-organization";
import { presentResource, presentRows } from "@/features/resources/presenters";
import { billingRows, usageRows } from "@/features/usage/usage-presenters";
import { CloudApiError, createCloudApi } from "@/services/cloud-api/client";
import type { ListEnvelope } from "@/services/cloud-api/types";

const token = process.env.CLOUD_API_TEST_TOKEN;
const describeLive = token ? describe : describe.skip;

function endpoint(id: ResourceId) {
  const found = findResource(id)?.endpoint;
  if (!found) throw new Error(`catalog has no endpoint for ${id}`);
  return found;
}

function firstId(list: ListEnvelope): string | undefined {
  const first: unknown = list.data[0];
  return typeof first === "object" && first !== null && "id" in first && typeof first.id === "string"
    ? first.id
    : undefined;
}

describeLive("Laravel Cloud read endpoints (live, view-only token)", () => {
  jest.setTimeout(60_000);
  const api = createCloudApi({ token: token ?? null });

  /** A read, or null when the token simply lacks permission for it (403). Anything else fails the test. */
  async function listOrForbidden(id: ResourceId, params: Record<string, string>) {
    const target = endpoint(id);
    try {
      return await api.list(target, params, target.defaultQuery?.());
    } catch (error) {
      if (error instanceof CloudApiError && error.status === 403) {
        console.warn(`[live] ${id}: this token is not allowed to view it (403)`);
        return null;
      }
      throw error;
    }
  }
  const found: Partial<Record<"application" | "environment" | "instance" | "database" | "filesystem" | "websocketServer", string>> = {};

  it("resolves the token's organization", async () => {
    const organization = organizationRefFrom(await api.get(endpoint("organization"), {}));
    expect(organization?.name).toBeTruthy();
  });

  it("lists applications with their environments included", async () => {
    const target = endpoint("applications");
    const list = await api.list(target, {}, target.defaultQuery?.());
    found.application = firstId(list);
    expect(list.meta).toMatchObject({ current_page: 1 });
    expect(Array.isArray(list.included ?? [])).toBe(true);
    const rows = presentRows(list);
    expect(rows).toHaveLength(list.data.length);
    expect(rows.map((row) => row.title)).not.toContain("Item");
    expect(list.data.map((item) => presentResource(item, 0).title)).toEqual(rows.map((row) => row.title));
  });

  it("lists environments of the first application", async () => {
    if (!found.application) return console.warn("[live] no application; skipping environments");
    const list = await api.list(endpoint("environments"), { application: found.application });
    found.environment = firstId(list);
    expect(Array.isArray(list.data)).toBe(true);
  });

  it.each<ResourceId>(["deployments", "commands", "instances", "domains", "environment-logs"])(
    "lists %s for the first environment",
    async (id) => {
      if (!found.environment) return console.warn(`[live] no environment; skipping ${id}`);
      const list = await listOrForbidden(id, { environment: found.environment });
      if (!list) return;
      if (id === "instances") found.instance = firstId(list);
      expect(Array.isArray(list.data)).toBe(true);
    },
  );

  it("lists background processes for the first instance", async () => {
    if (!found.instance) return console.warn("[live] no instance; skipping background processes");
    const list = await api.list(endpoint("background-processes"), { instance: found.instance });
    expect(Array.isArray(list.data)).toBe(true);
  });

  it.each<ResourceId>([
    "database-clusters",
    "object-storage-buckets",
    "caches",
    "edge-networks",
    "dedicated-clusters",
    "websocket-clusters",
    "secrets",
    "regions",
  ])("lists %s for the organization", async (id) => {
    const list = await listOrForbidden(id, {});
    if (!list) return;
    if (id === "database-clusters") found.database = firstId(list);
    if (id === "object-storage-buckets") found.filesystem = firstId(list);
    if (id === "websocket-clusters") found.websocketServer = firstId(list);
    expect(Array.isArray(list.data)).toBe(true);
  });

  it("lists databases and snapshots of the first database cluster", async () => {
    if (!found.database) return console.warn("[live] no database cluster; skipping databases");
    for (const id of ["databases", "database-snapshots"] as const) {
      const list = await api.list(endpoint(id), { database: found.database });
      expect(Array.isArray(list.data)).toBe(true);
    }
  });

  it("lists keys of the first bucket", async () => {
    if (!found.filesystem) return console.warn("[live] no bucket; skipping bucket keys");
    const list = await api.list(endpoint("bucket-keys"), { filesystem: found.filesystem });
    expect(Array.isArray(list.data)).toBe(true);
  });

  it("lists applications of the first WebSocket cluster", async () => {
    if (!found.websocketServer) return console.warn("[live] no WebSocket cluster; skipping");
    const list = await api.list(endpoint("websocket-applications"), { websocketServer: found.websocketServer });
    expect(Array.isArray(list.data)).toBe(true);
  });

  it("reads the usage report into billing and usage rows", async () => {
    const report = await api.get(endpoint("usage"), {});
    expect(billingRows(report).length).toBeGreaterThan(0);
    expect(usageRows(report).length).toBeGreaterThan(0);
  });
});
