import {
  ALL_RESOURCES,
  findResource,
  RESOURCE_MENU,
} from "@/features/cloud-resources/catalog";
import { SCOPE_PATH_PARAM } from "@/features/cloud-resources/scope";

const PLACEHOLDER = /\{([^}]+)\}/g;

function placeholders(path: string) {
  return [...path.matchAll(PLACEHOLDER)].map((match) => match[1]);
}

describe("resource menu catalog", () => {
  it("groups resources into the agreed sections, in order", () => {
    expect(RESOURCE_MENU.map((section) => section.title)).toEqual([
      "Overview",
      "Deploy",
      "Data",
      "Storage & Cache",
      "Network",
      "Realtime",
      "Account",
    ]);
  });

  it("covers every Cloud API resource type once", () => {
    const ids = ALL_RESOURCES.map((item) => item.id);

    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toEqual([
      "applications",
      "environments",
      "usage",
      "billing",
      "deployments",
      "commands",
      "instances",
      "background-processes",
      "environment-logs",
      "database-clusters",
      "databases",
      "database-snapshots",
      "database-restores",
      "object-storage-buckets",
      "bucket-keys",
      "caches",
      "domains",
      "edge-networks",
      "dedicated-clusters",
      "websocket-clusters",
      "websocket-applications",
      "secrets",
      "organization",
      "regions",
    ]);
  });

  it("gives every item a cross-platform icon", () => {
    for (const item of ALL_RESOURCES) {
      expect(item.icon).toEqual(
        expect.objectContaining({
          android: expect.any(String),
          ios: expect.any(String),
          web: expect.any(String),
        }),
      );
    }
  });

  it("declares path params that match the placeholders in each path", () => {
    for (const item of ALL_RESOURCES) {
      if (!item.endpoint) continue;

      expect(item.endpoint.path.startsWith("/")).toBe(true);
      expect([...item.endpoint.params]).toEqual(
        placeholders(item.endpoint.path),
      );
      expect(item.endpoint.method).toBe("GET");
      expect(item.endpoint.operationId).toMatch(/^public\./);
    }
  });

  it("declares a scope whose path param is exactly what the endpoint needs", () => {
    for (const item of ALL_RESOURCES) {
      if (!item.endpoint) continue;

      const expected = SCOPE_PATH_PARAM[item.scope];
      expect([...item.endpoint.params]).toEqual(expected ? [expected] : []);
    }
  });

  it("keeps Database Restores in the menu but records that Cloud has no list endpoint", () => {
    const restores = findResource("database-restores");

    expect(restores?.endpoint).toBeNull();
    expect(restores?.note).toMatch(/no list endpoint/i);
  });

  it("uses the endpoints confirmed against the OpenAPI spec", () => {
    expect(findResource("usage")?.endpoint).toMatchObject({
      operationId: "public.usage",
      path: "/usage",
    });
    expect(findResource("instances")?.endpoint).toMatchObject({
      path: "/environments/{environment}/instances",
    });
    expect(findResource("edge-networks")?.endpoint).toMatchObject({
      path: "/edge-networks",
    });
    expect(findResource("secrets")?.endpoint).toMatchObject({
      path: "/secrets",
    });
    expect(findResource("bucket-keys")?.endpoint).toMatchObject({
      path: "/buckets/{filesystem}/keys",
    });
    expect(findResource("websocket-applications")?.endpoint).toMatchObject({
      path: "/websocket-servers/{websocketServer}/applications",
    });
    expect(findResource("organization")?.endpoint).toMatchObject({
      kind: "single",
      path: "/meta/organization",
    });
  });

  it("finds an item by id and returns undefined for anything else", () => {
    expect(findResource("deployments")?.label).toBe("Deployments");
    expect(findResource("not-a-resource")).toBeUndefined();
    expect(findResource("")).toBeUndefined();
  });
});

describe("applications endpoint", () => {
  it("asks for the environments alongside, since applications have no status of their own", () => {
    expect(findResource("applications")?.endpoint?.defaultQuery?.()).toEqual({ include: "environments" });
  });
});
