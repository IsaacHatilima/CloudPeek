import { nextPageQuery, mergePages } from "@/services/cloud-api/pagination";
import { createCloudApi } from "@/services/cloud-api/client";
import { findResource } from "@/features/cloud-resources/catalog";

const item = { id: "app-1", type: "applications", attributes: { name: "Example" } };

describe("Cloud pagination", () => {
  it("takes only a page number from links and preserves the original include/filter", () => {
    expect(nextPageQuery({ data: [item], links: { next: "https://untrusted.invalid/apps?page=2&include=secrets" } }, { include: "environments" }))
      .toEqual({ include: "environments", page: 2 });
    expect(nextPageQuery({ data: [item], links: { next: "?page=2" } }, { page: 2 })).toBeUndefined();
  });

  it("advances Laravel paginator metadata and stops at the final or empty page", () => {
    expect(nextPageQuery({ data: [item], meta: { current_page: 2, last_page: 3 } }, { page: 2 })).toEqual({ page: 3 });
    expect(nextPageQuery({ data: [item], meta: { current_page: 3, last_page: 3 } }, { page: 3 })).toBeUndefined();
    expect(nextPageQuery({ data: [], links: { next: "?page=2" } })).toBeUndefined();
    expect(nextPageQuery({ data: [item], links: { next: "http://[" } })).toBeUndefined();
  });

  it("keeps the log time window while advancing cursors and detects repeats", () => {
    const query = { from: "start", to: "end" };
    expect(nextPageQuery({ data: [{ message: "log" }], meta: { cursor: "next" } }, query)).toEqual({ ...query, cursor: "next" });
    expect(nextPageQuery({ data: [{ message: "log" }], meta: { cursor: "next" } }, { ...query, cursor: "next" })).toBeUndefined();
    expect(nextPageQuery({ data: [{ message: "log" }], meta: { cursor: "" } }, query)).toBeUndefined();
  });

  it("merges included relationships and overlapping resources without losing plain log entries", () => {
    const related = { id: "env-1", type: "environments" };
    expect(mergePages([{ data: [item], included: [related] }, { data: [item, { message: "log" }], included: [related] }]))
      .toMatchObject({ data: [item, { message: "log" }], included: [related] });
  });

  it("loads every scope-picker page using the configured host and auth header", async () => {
    const seen: Request[] = [];
    const api = createCloudApi({ token: "test-token" }, async (request) => {
      seen.push(request);
      const second = new URL(request.url).searchParams.get("page") === "2";
      return new Response(JSON.stringify({ data: [{ ...item, id: second ? "app-2" : "app-1" }], links: { next: second ? null : "https://untrusted.invalid/?page=2" }, meta: { current_page: second ? 2 : 1, last_page: 2 } }), { status: 200 });
    });
    const result = await api.listAll(findResource("applications")!.endpoint!, {}, { include: "environments" });
    expect(result.data.map((entry) => entry.id)).toEqual(["app-1", "app-2"]);
    expect(seen).toHaveLength(2);
    for (const request of seen) {
      expect(new URL(request.url).origin).toBe("https://cloud.laravel.com");
      expect(new URL(request.url).searchParams.get("include")).toBe("environments");
      expect(request.headers.get("Authorization")).toBe("Bearer test-token");
    }
  });
});
