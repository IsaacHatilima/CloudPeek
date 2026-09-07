/**
 * Turns validated form values into what the client sends: path params, query
 * inputs, and a body object nested by each field's path. Text is coerced to
 * the type Cloud expects; on an update only changed fields are sent, and a
 * nullable field cleared by the user is sent as `null`.
 */
import type { WriteOperation } from "@/services/cloud-api/operation-types";

import {
  type FormField,
  type FormMode,
  type FormValue,
  type FormValues,
  isEmpty,
} from "./form-model";
import { listEntries } from "./form-validation";

export type WriteRequest = {
  body: Readonly<Record<string, unknown>> | null;
  params: Readonly<Record<string, string>>;
  query: Readonly<Record<string, string>>;
};

function coerce(field: FormField, value: FormValue): unknown {
  if (typeof value !== "string") return value;
  const text = value.trim();
  switch (field.kind) {
    case "integer":
    case "number":
      return Number(text);
    case "enum":
      return field.numeric ? Number(text) : text;
    case "string-list":
      return listEntries(text);
    case "json":
      return JSON.parse(text) as unknown;
    default:
      return text;
  }
}

function sameValue(a: FormValue | undefined, b: FormValue | undefined): boolean {
  if (typeof a === "object" && a !== null && typeof b === "object" && b !== null) {
    return a.uri === b.uri;
  }
  return (a ?? null) === (b ?? null);
}

function shouldSend(
  field: FormField,
  value: FormValue | undefined,
  initial: FormValue | undefined,
  mode: FormMode,
): boolean {
  if (field.section !== "body" || mode === "create") return !isEmpty(value);
  if (field.required) return !isEmpty(value);
  if (sameValue(value, initial)) return false;
  return !isEmpty(value) || field.nullable;
}

function setPath(
  target: Readonly<Record<string, unknown>>,
  path: readonly string[],
  value: unknown,
): Readonly<Record<string, unknown>> {
  const [head, ...rest] = path;
  if (rest.length === 0) return { ...target, [head]: value };
  const existing = target[head];
  const inner = typeof existing === "object" && existing !== null ? existing : {};
  return { ...target, [head]: setPath(inner as Record<string, unknown>, rest, value) };
}

function queryText(value: unknown): string {
  return Array.isArray(value) ? value.join(",") : String(value);
}

function place(request: WriteRequest, field: FormField, value: unknown): WriteRequest {
  if (field.section === "param") {
    return { ...request, params: { ...request.params, [field.name]: String(value) } };
  }
  if (field.section === "query") {
    return { ...request, query: { ...request.query, [field.name]: queryText(value) } };
  }
  return { ...request, body: setPath(request.body ?? {}, field.path, value) };
}

export function buildRequest(
  op: WriteOperation,
  fields: readonly FormField[],
  values: FormValues,
  initial: FormValues,
  mode: FormMode,
): WriteRequest {
  const empty: WriteRequest = { body: op.body ? {} : null, params: {}, query: {} };

  return fields.reduce((request, field) => {
    const value = values[field.name];
    if (!shouldSend(field, value, initial[field.name], mode)) return request;
    return place(request, field, isEmpty(value) ? null : coerce(field, value ?? null));
  }, empty);
}
