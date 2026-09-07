/**
 * Laravel Cloud API client.
 *
 * `client` is an openapi-fetch instance typed from the vendored OpenAPI
 * document, so every one of Cloud's operations is available and checked at
 * compile time: `api.client.GET("/applications", …)`,
 * `api.client.POST("/environments/{environment}/deployments", …)`, and so on.
 * Writes need a token with write permissions; a view-only token gets a 403.
 *
 * `list` and `get` are the untyped conveniences the catalog-driven screens use,
 * with the JSON:API envelope validated at the boundary. Failures of every kind
 * (no token, network, non-2xx) surface as thrown errors, which is what React
 * Query expects.
 */
import createClient, { type Middleware } from "openapi-fetch";

import type { CloudEndpoint } from "@/features/cloud-resources/types";

import { CLOUD_API_BASE_URL, type QueryParams } from "./build-path";
import { CloudApiError, CloudApiNotConnectedError } from "./errors";
import { toFormData } from "./multipart";
import type { WriteOperation } from "./operation-types";
import type { paths } from "./schema";
import type { JsonApiSingle, ListEnvelope, ReportEnvelope } from "./types";

export { CloudApiError, CloudApiNotConnectedError, describeApiError } from "./errors";

export type CloudApiConfig = {
  baseUrl?: string;
  /** Bearer token minted in Cloud's organization settings. One per organization. */
  token: string | null;
};

/** openapi-fetch hands the fully built Request over; React Native's fetch accepts it. */
export type CloudApiFetch = (request: Request) => Promise<Response>;

export type CloudApiClient = ReturnType<typeof createClient<paths>>;

/** What a write sends: path params, an optional body object, optional query inputs. */
export type WriteInput = {
  body?: Readonly<Record<string, unknown>> | null;
  params: Readonly<Record<string, string>>;
  query?: Readonly<Record<string, string>>;
};

export type CloudApi = {
  client: CloudApiClient;
  /** One resource (`single`) or a plain `data` object (`report`). */
  get(
    endpoint: CloudEndpoint,
    params: Record<string, string>,
    query?: QueryParams,
  ): Promise<JsonApiSingle | ReportEnvelope>;
  /** A `collection` (paginated JSON:API) or a plain `list` (`data[]`). */
  list(
    endpoint: CloudEndpoint,
    params: Record<string, string>,
    query?: QueryParams,
  ): Promise<ListEnvelope>;
  /**
   * One write operation (POST/PATCH/PUT/DELETE). Resolves with the parsed
   * response body, or undefined for an empty 204. A view-only token gets a 403.
   */
  request(operation: WriteOperation, input: WriteInput): Promise<unknown>;
};

type RequestInit = {
  body?: unknown;
  params: { path: Readonly<Record<string, string>>; query?: QueryParams };
};

type UntypedClient = Record<
  "DELETE" | "GET" | "PATCH" | "POST" | "PUT",
  (path: string, init: RequestInit) => Promise<{ data: unknown; response: Response }>
>;

const defaultFetch: CloudApiFetch = (request) => fetch(request);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function detail(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

async function errorMessage(response: Response): Promise<string> {
  const text = await response.text().catch(() => "");
  try {
    const body: unknown = JSON.parse(text);
    if (isRecord(body) && typeof body.message === "string" && body.message) {
      return body.message;
    }
  } catch {
    // Not JSON; fall through to the generic message.
  }
  return `Laravel Cloud responded with HTTP ${response.status}`;
}

/** A fetch that never gets a response becomes the same error type as a bad one. */
function guardedFetch(fetchImpl: CloudApiFetch): CloudApiFetch {
  return async (request) => {
    try {
      return await fetchImpl(request);
    } catch (error) {
      throw new CloudApiError(0, `Could not reach Laravel Cloud: ${detail(error)}`);
    }
  };
}

/**
 * Both hooks return nothing: the request is mutated in place and the response
 * is left as it is. openapi-fetch checks any returned value with `instanceof`,
 * and React Native's fetch objects fail that check even when unchanged.
 */
function cloudMiddleware(token: string | null): Middleware {
  return {
    onRequest({ request }) {
      if (!token) throw new CloudApiNotConnectedError();
      request.headers.set("Authorization", `Bearer ${token}`);
      request.headers.set("Accept", "application/vnd.api+json");
    },
    async onResponse({ response }) {
      if (response.ok) return;
      throw new CloudApiError(response.status, await errorMessage(response));
    },
  };
}

function isListEnvelope(body: unknown, endpoint: CloudEndpoint): body is ListEnvelope {
  if (!isRecord(body) || !Array.isArray(body.data)) return false;
  if (endpoint.kind !== "collection") return true;
  return isRecord(body.links) && isRecord(body.meta);
}

function hasDataObject(body: unknown): body is JsonApiSingle | ReportEnvelope {
  return isRecord(body) && isRecord(body.data);
}

function unexpectedShape(status: number, endpoint: CloudEndpoint): CloudApiError {
  return new CloudApiError(status, `Unexpected response shape from ${endpoint.operationId}`);
}

/** openapi-fetch sends FormData as it is and lets fetch set the multipart boundary. */
function writeInit(operation: WriteOperation, input: WriteInput): RequestInit {
  const body = input.body ?? undefined;
  const multipart = operation.body?.contentType === "multipart";
  return {
    body: multipart && body ? toFormData(body) : body,
    params: { path: input.params, query: input.query },
  };
}

export function createCloudApi(
  config: CloudApiConfig,
  fetchImpl: CloudApiFetch = defaultFetch,
): CloudApi {
  const client = createClient<paths>({
    baseUrl: config.baseUrl ?? CLOUD_API_BASE_URL,
    fetch: guardedFetch(fetchImpl),
  });
  client.use(cloudMiddleware(config.token));
  const untyped = client as unknown as UntypedClient;

  return {
    client,
    async get(endpoint, params, query) {
      const { data, response } = await untyped.GET(endpoint.path, {
        params: { path: params, query },
      });
      if (!hasDataObject(data)) throw unexpectedShape(response.status, endpoint);
      return data;
    },
    async list(endpoint, params, query) {
      const { data, response } = await untyped.GET(endpoint.path, {
        params: { path: params, query },
      });
      if (!isListEnvelope(data, endpoint)) throw unexpectedShape(response.status, endpoint);
      return data;
    },
    async request(operation, input) {
      const { data } = await untyped[operation.method](operation.path, writeInit(operation, input));
      return data;
    },
  };
}

/** Kept as an alias so callers can name it either way. */
export const createCloudApiClient = createCloudApi;
