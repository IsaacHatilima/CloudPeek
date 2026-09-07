/**
 * The shape of Cloud's write operations as Cloud Peek renders them: one entry
 * per POST/PATCH/PUT/DELETE in the OpenAPI document, with the request body
 * reduced to a flat list of form fields. `write-operations.generated.ts` holds
 * the data and is produced by `scripts/generate-cloud-api-operations.mjs`.
 */

export type FieldKind =
  | "boolean"
  | "enum"
  | "file"
  | "integer"
  | "json"
  | "number"
  | "string"
  | "string-list";

export type FieldSchema = {
  description?: string;
  /** A sample value, shown as the placeholder (JSON fields get a whole example document). */
  example?: string;
  format?: string;
  kind: FieldKind;
  max?: number;
  maxLength?: number;
  min?: number;
  minLength?: number;
  /** Dotted display name, e.g. `config.queue` for a nested property. */
  name: string;
  nullable: boolean;
  /** `enum` values, or the allowed entries of a `string-list`. */
  options?: readonly string[];
  /** True for an `enum` whose values Cloud expects as numbers. */
  numeric?: boolean;
  /** Where the value goes in the request body: `["config", "queue"]`. */
  path: readonly string[];
  pattern?: string;
  required: boolean;
};

export type WriteMethod = "DELETE" | "PATCH" | "POST" | "PUT";

export type WriteBody = {
  contentType: "json" | "multipart";
  fields: readonly FieldSchema[];
};

export type WriteOperation = {
  /** `null` for operations that send no body (deletes, start/stop, verify…). */
  body: WriteBody | null;
  description?: string;
  method: WriteMethod;
  operationId: string;
  /** Path placeholders in order, using Cloud's own parameter names. */
  params: readonly string[];
  path: string;
  /** Query-string inputs, when the operation documents any. */
  query: readonly FieldSchema[];
  summary: string;
  tag: string;
};
