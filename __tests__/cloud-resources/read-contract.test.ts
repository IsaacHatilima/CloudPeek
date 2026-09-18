import { ALL_RESOURCES } from "@/features/cloud-resources/catalog";
import { DETAIL_ENDPOINTS, detailRequest } from "@/features/cloud-resources/detail-endpoints";
import { DATABASE_TYPES_ENDPOINT } from "@/features/actions/database-options";
import { createCloudApi } from "@/services/cloud-api/client";
import { buildPath } from "@/services/cloud-api/build-path";

const spec = require("../../contracts/laravel-cloud-openapi.json") as { paths: Record<string, { get?: { operationId: string; tags: string[]; parameters?: { in: string; name: string }[] } }> };
const endpoints = [...new Map([...ALL_RESOURCES.flatMap((item) => item.endpoint ? [item.endpoint] : []), ...Object.values(DETAIL_ENDPOINTS), DATABASE_TYPES_ENDPOINT].map((endpoint) => [endpoint.operationId, endpoint])).values()];

describe("read routes against the current Laravel Cloud contract", () => {
  it.each(endpoints)("$operationId uses the documented method, path, parameters and bearer header", async (endpoint) => {
    const operation = spec.paths[endpoint.path]?.get;
    expect(operation?.operationId).toBe(endpoint.operationId);
    expect(operation?.tags).not.toContain("Databases (Legacy)");
    expect(endpoint.params).toEqual((operation?.parameters ?? []).filter((param) => param.in === "path").map((param) => param.name));
    const params = Object.fromEntries(endpoint.params.map((param) => [param, `${param} with space`]));
    const isList = ["list", "collection"].includes(endpoint.kind);
    const response = { data: isList ? [] : { id: "resource", type: "example" }, links: {}, meta: {} };
    const fetchMock = jest.fn(async (_request: Request) => new Response(JSON.stringify(response), { status: 200 }));
    const api = createCloudApi({ token: "test-only" }, fetchMock);
    await (isList ? api.list(endpoint, params, endpoint.defaultQuery?.()) : api.get(endpoint, params, endpoint.defaultQuery?.()));
    const request = fetchMock.mock.calls[0]?.[0] as unknown as Request;
    expect(request.method).toBe("GET");
    expect(new URL(request.url).pathname).toBe(`/api${buildPath(endpoint, params)}`);
    expect(request.headers.get("Authorization")).toBe("Bearer test-only");
  });

  it("uses a direct item read, preserving only required parent IDs", () => {
    const list = ALL_RESOURCES.find((item) => item.id === "databases")!.endpoint!;
    expect(detailRequest(list, { database: "cluster", environment: "unrelated" }, "schema")).toMatchObject({
      endpoint: { path: "/databases/clusters/{database}/databases/{schema}" }, params: { database: "cluster", schema: "schema" },
    });
    expect(detailRequest(ALL_RESOURCES.find((item) => item.id === "secrets")!.endpoint!, {}, "secret")).toBeNull();
  });

  it("explicitly accounts for supplementary reads that do not yet have UI", () => {
    const covered = new Set(endpoints.map((endpoint) => endpoint.path));
    const missing = Object.entries(spec.paths).filter(([path, item]) => item.get && !item.get.tags.includes("Databases (Legacy)") && !covered.has(path)).map(([path]) => path).sort();
    expect(missing).toEqual([
      "/caches/types", "/caches/{cache}/metrics", "/databases/clusters/{database}/metrics",
      "/deployments/{deployment}/logs", "/environments/{environment}/metrics", "/instances/sizes",
      "/instances/{instance}/failed-jobs", "/secrets/public-key", "/websocket-applications/{websocketApplication}/metrics",
      "/websocket-servers/{websocketServer}/metrics",
    ].sort());
  });
});
