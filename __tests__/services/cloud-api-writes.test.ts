import { CloudApiError, CloudApiNotConnectedError, createCloudApi } from "@/services/cloud-api/client";
import { isFilePart, toFormData } from "@/services/cloud-api/multipart";
import type { WriteOperation } from "@/services/cloud-api/operation-types";
import { WRITE_OPERATIONS } from "@/services/cloud-api/write-operations.generated";

const op = (id: string): WriteOperation => {
  const found = WRITE_OPERATIONS.find((candidate) => candidate.operationId === id);
  if (!found) throw new Error(`no operation ${id}`);
  return found;
};

function respondWith(status: number, body?: unknown) {
  return jest.fn(
    async (_request: Request) =>
      new Response(body === undefined ? null : JSON.stringify(body), {
        headers: body === undefined ? {} : { "content-type": "application/vnd.api+json" },
        status,
      }),
  );
}

function sentRequest(fetchMock: jest.Mock): Request {
  const request: unknown = fetchMock.mock.calls[0]?.[0];
  if (!(request instanceof Request)) throw new Error("fetch was not called with a Request");
  return request;
}

const BASE = "https://cloud.test/api";

describe("cloud api writes", () => {
  it("posts a JSON body with the auth headers and returns the created resource", async () => {
    const created = { data: { attributes: { name: "new-app" }, id: "app_9", type: "applications" } };
    const fetchMock = respondWith(201, created);
    const api = createCloudApi({ baseUrl: BASE, token: "tok" }, fetchMock);

    const result = await api.request(op("public.applications.store"), {
      body: { name: "new-app", region: "us-east-1", repository: "org/repo" },
      params: {},
    });

    const request = sentRequest(fetchMock);
    expect(request.method).toBe("POST");
    expect(request.url).toBe(`${BASE}/applications`);
    expect(request.headers.get("authorization")).toBe("Bearer tok");
    expect(request.headers.get("accept")).toBe("application/vnd.api+json");
    expect(request.headers.get("content-type")).toBe("application/json");
    expect(JSON.parse(await request.text())).toEqual({ name: "new-app", region: "us-east-1", repository: "org/repo" });
    expect(result).toEqual(created);
  });

  it("fills path params, sends no body on a delete, and resolves undefined for 204", async () => {
    const fetchMock = respondWith(204);
    const api = createCloudApi({ baseUrl: BASE, token: "tok" }, fetchMock);

    const result = await api.request(op("public.databases.clusters.databases.destroy"), {
      params: { database: "db 1", schema: "app" },
    });

    const request = sentRequest(fetchMock);
    expect(request.method).toBe("DELETE");
    expect(request.url).toBe(`${BASE}/databases/clusters/db%201/databases/app`);
    expect(request.headers.get("content-type")).toBeNull();
    expect(result).toBeUndefined();
  });

  it("puts query inputs on the URL", async () => {
    const fetchMock = respondWith(204);
    const api = createCloudApi({ baseUrl: BASE, token: "tok" }, fetchMock);

    await api.request(op("public.instances.failed-jobs.destroy-many"), {
      params: { instance: "inst_1" },
      query: { jobIds: "1,2" },
    });

    const url = new URL(sentRequest(fetchMock).url);
    expect(url.pathname).toBe("/api/instances/inst_1/failed-jobs");
    expect(url.searchParams.get("jobIds")).toBe("1,2");
  });

  it("sends the avatar as multipart form data instead of JSON", async () => {
    const fetchMock = respondWith(200, { data: { id: "app_1", type: "applications" } });
    const api = createCloudApi({ baseUrl: BASE, token: "tok" }, fetchMock);

    await api.request(op("public.applications.avatar.store"), {
      body: { avatar: { mimeType: "image/png", name: "avatar.png", uri: "file:///avatar.png" } },
      params: { application: "app_1" },
    });

    const request = sentRequest(fetchMock);
    expect(request.method).toBe("POST");
    expect(request.url).toBe(`${BASE}/applications/app_1/avatar`);
    expect(request.headers.get("content-type")).toMatch(/^multipart\/form-data/);
    const form = (await request.formData()) as unknown as { has(name: string): boolean };
    expect(form.has("avatar")).toBe(true);
  });

  it("turns a 403 from a view-only token into a CloudApiError with Cloud's message", async () => {
    const fetchMock = respondWith(403, { message: "This action is unauthorized." });
    const api = createCloudApi({ baseUrl: BASE, token: "tok" }, fetchMock);

    const failure = api.request(op("public.environments.stop"), { params: { environment: "env_1" } });
    await expect(failure).rejects.toMatchObject({ message: "This action is unauthorized.", status: 403 });
    await expect(failure).rejects.toBeInstanceOf(CloudApiError);
  });

  it("refuses to write without a token", async () => {
    const fetchMock = respondWith(200, {});
    const api = createCloudApi({ baseUrl: BASE, token: null }, fetchMock);

    await expect(
      api.request(op("public.environments.start"), { body: {}, params: { environment: "env_1" } }),
    ).rejects.toBeInstanceOf(CloudApiNotConnectedError);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("multipart", () => {
  it("recognises file parts and appends everything else as text", () => {
    expect(isFilePart({ name: "a.png", uri: "file:///a.png" })).toBe(true);
    expect(isFilePart({ name: "a.png" })).toBe(false);
    expect(isFilePart("file:///a.png")).toBe(false);

    const form = toFormData({ count: 2, nested: { a: 1 }, skipped: null, text: "x" });
    expect(form.get("count")).toBe("2");
    expect(form.get("nested")).toBe('{"a":1}');
    expect(form.get("text")).toBe("x");
    expect(form.has("skipped")).toBe(false);
  });
});
