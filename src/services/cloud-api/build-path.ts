import type { CloudEndpoint } from "@/features/cloud-resources/types";

export const CLOUD_API_BASE_URL = "https://cloud.laravel.com/api";

export type QueryValue = boolean | number | string | undefined;
export type QueryParams = Record<string, QueryValue>;

export class MissingPathParamError extends Error {
  constructor(param: string, endpoint: CloudEndpoint) {
    super(
      `Missing required path param "${param}" for ${endpoint.operationId} (${endpoint.path})`,
    );
    this.name = "MissingPathParamError";
  }
}

/**
 * Substitutes `{param}` placeholders with encoded values. Throws rather than
 * sending a path with an empty segment: `/environments//domains` is a request
 * Cloud's docs explicitly warn against.
 */
export function buildPath(
  endpoint: CloudEndpoint,
  values: Record<string, string>,
): string {
  return endpoint.params.reduce((path, param) => {
    const value = values[param];
    if (!value) throw new MissingPathParamError(param, endpoint);
    return path.replaceAll(`{${param}}`, encodeURIComponent(value));
  }, endpoint.path);
}

/** Full request URL: base + built path + query string (undefined values skipped). */
export function buildUrl(
  endpoint: CloudEndpoint,
  values: Record<string, string>,
  query?: QueryParams,
  baseUrl: string = CLOUD_API_BASE_URL,
): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined) search.append(key, String(value));
  }

  const url = `${baseUrl.replace(/\/+$/, "")}${buildPath(endpoint, values)}`;
  const queryString = search.toString();

  return queryString ? `${url}?${queryString}` : url;
}
