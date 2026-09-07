/** JSON:API envelope shapes as Cloud returns them (Laravel paginator meta). */

export type JsonApiResource<
  TAttributes extends Record<string, unknown> = Record<string, unknown>,
> = {
  attributes?: TAttributes;
  id: string;
  links?: Record<string, unknown>;
  relationships?: Record<string, unknown>;
  type: string;
};

export type PaginationLinks = {
  first?: string;
  last?: string;
  next?: string | null;
  prev?: string | null;
};

export type PaginationMeta = {
  current_page: number;
  from: number | null;
  last_page: number;
  links: readonly { active: boolean; label: string; url: string | null }[];
  path: string | null;
  per_page: number;
  to: number | null;
  total: number;
};

export type JsonApiCollection<T = JsonApiResource> = {
  data: T[];
  included?: JsonApiResource[];
  links: PaginationLinks;
  meta: PaginationMeta;
};

export type JsonApiSingle<T = JsonApiResource> = {
  data: T;
  included?: JsonApiResource[];
};

/** `report` endpoints (usage, logs, regions): a `data` object of any shape. */
export type ReportEnvelope = {
  data: Record<string, unknown>;
  meta?: Record<string, unknown>;
};

/**
 * What `client.list` resolves to: `data[]` always; `links`/`meta` present for
 * paginated `collection` endpoints, `meta` alone for cursor-paginated logs,
 * neither for plain lists such as regions.
 */
export type ListEnvelope<T = JsonApiResource | Record<string, unknown>> = {
  data: T[];
  included?: JsonApiResource[];
  links?: PaginationLinks;
  meta?: PaginationMeta | Record<string, unknown>;
};

/** Every schema in Cloud's OpenAPI document, e.g. `Schemas["ApplicationResource"]`. */
export type Schemas = import("./schema").components["schemas"];
