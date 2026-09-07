import type { CloudEndpoint } from "@/features/cloud-resources/types";
import {
  CloudApiError,
  CloudApiNotConnectedError,
  createCloudApi,
} from "@/services/cloud-api/client";

const deployments: CloudEndpoint = {
  kind: "collection",
  method: "GET",
  operationId: "public.environments.deployments.index",
  params: ["environment"],
  path: "/environments/{environment}/deployments",
};

const organization: CloudEndpoint = {
  kind: "single",
  method: "GET",
  operationId: "public.meta.organization",
  params: [],
  path: "/meta/organization",
};

const emptyPage = {
  data: [],
  links: { first: "f", last: "l", next: null, prev: null },
  meta: { current_page: 1, from: null, last_page: 1, links: [], path: "/", per_page: 25, to: null, total: 0 },
};

function respondWith(status: number, body: unknown) {
  return jest.fn(
    async (_request: Request) =>
      new Response(JSON.stringify(body), {
        headers: { "content-type": "application/vnd.api+json" },
        status,
      }),
  );
}

function sentRequest(fetchMock: jest.Mock): Request {
  const request: unknown = fetchMock.mock.calls[0]?.[0];
  if (!(request instanceof Request)) throw new Error("fetch was not called with a Request");
  return request;
}

describe("cloud api", () => {
  it("rejects every call until a token exists, without touching the network", async () => {
    const fetchMock = respondWith(200, emptyPage);
    const api = createCloudApi({ token: null }, fetchMock);

    await expect(api.list(deployments, { environment: "env_1" })).rejects.toBeInstanceOf(
      CloudApiNotConnectedError,
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("sends a bearer token and the JSON:API accept header to the built URL", async () => {
    const fetchMock = respondWith(200, emptyPage);
    const api = createCloudApi({ token: "tok_123" }, fetchMock);

    const page = await api.list(deployments, { environment: "env_1" }, { "filter[status]": "running" });
    const request = sentRequest(fetchMock);
    const url = new URL(request.url);

    expect(page).toEqual(emptyPage);
    expect(request.method).toBe("GET");
    expect(`${url.origin}${url.pathname}`).toBe(
      "https://cloud.laravel.com/api/environments/env_1/deployments",
    );
    expect(url.searchParams.get("filter[status]")).toBe("running");
    expect(request.headers.get("authorization")).toBe("Bearer tok_123");
    expect(request.headers.get("accept")).toBe("application/vnd.api+json");
  });

  it("reads a single resource", async () => {
    const body = { data: { attributes: { name: "Acme", slug: "acme" }, id: "org_1", type: "organizations" } };
    const api = createCloudApi({ token: "tok_123" }, respondWith(200, body));

    await expect(api.get(organization, {})).resolves.toEqual(body);
  });

  it("surfaces an API error with the status and Cloud's message", async () => {
    const api = createCloudApi({ token: "tok_123" }, respondWith(401, { message: "Unauthenticated." }));

    const failure = api.list(deployments, { environment: "env_1" });

    await expect(failure).rejects.toBeInstanceOf(CloudApiError);
    await expect(failure).rejects.toMatchObject({ message: "Unauthenticated.", status: 401 });
  });

  it("rejects a 2xx body that is not the JSON:API envelope", async () => {
    const api = createCloudApi({ token: "tok_123" }, respondWith(200, { unexpected: true }));

    await expect(api.list(deployments, { environment: "env_1" })).rejects.toMatchObject({ status: 200 });
  });

  it("wraps a fetch that never gets a response in a CloudApiError with status 0", async () => {
    const api = createCloudApi(
      { token: "tok_123" },
      jest.fn(async () => {
        throw new Error("Network request failed");
      }),
    );

    const failure = api.list(deployments, { environment: "env_1" });

    await expect(failure).rejects.toBeInstanceOf(CloudApiError);
    await expect(failure).rejects.toMatchObject({ status: 0 });
    await expect(failure).rejects.toThrow(/Network request failed/);
  });

  it("exposes every typed operation on client, writes included", async () => {
    const fetchMock = respondWith(200, { data: { id: "env_1", type: "environments" } });
    const api = createCloudApi({ token: "tok_123" }, fetchMock);

    await api.client.POST("/environments/{environment}/start", {
      params: { path: { environment: "env_1" } },
    });
    const request = sentRequest(fetchMock);

    expect(request.method).toBe("POST");
    expect(request.url).toBe("https://cloud.laravel.com/api/environments/env_1/start");
    expect(request.headers.get("authorization")).toBe("Bearer tok_123");
  });

  it("does not leak the token when the config object is reused", () => {
    const config = { token: "tok_123" };
    createCloudApi(config, respondWith(200, emptyPage));

    expect(config).toEqual({ token: "tok_123" });
  });
});
