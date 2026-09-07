/**
 * An action form as data: the fields to show for one operation and the values
 * they start with. Pure, so it is tested without rendering.
 *
 * A form has up to three sections: path placeholders the current scope cannot
 * fill (a failed job's id), the request body, and query inputs. Text fields
 * hold strings even for numbers, so what the user typed survives validation;
 * booleans hold `null` until touched so an optional flag is not sent unasked.
 */
import type { FieldSchema, WriteOperation } from "@/services/cloud-api/operation-types";

export type FileValue = { mimeType?: string; name: string; uri: string };
export type FormValue = FileValue | boolean | string | null;
export type FormValues = Readonly<Record<string, FormValue>>;
export type FormSection = "body" | "param" | "query";
export type FormField = FieldSchema & { section: FormSection };
export type FormMode = "create" | "update";

export const TEXT_KINDS: ReadonlySet<FieldSchema["kind"]> = new Set([
  "enum",
  "integer",
  "json",
  "number",
  "string",
  "string-list",
]);

function paramField(name: string): FormField {
  return { kind: "string", name, nullable: false, path: [name], required: true, section: "param" };
}

/** Missing path params first, then the body, then any query inputs. */
export function formFields(
  op: WriteOperation,
  params: Readonly<Record<string, string>>,
): readonly FormField[] {
  const missing = op.params.filter((param) => !(param in params)).map(paramField);
  const body = (op.body?.fields ?? []).map((field): FormField => ({ ...field, section: "body" }));
  const query = op.query.map((field): FormField => ({ ...field, section: "query" }));
  return [...missing, ...body, ...query];
}

function words(part: string): string {
  const spaced = part.replace(/_/g, " ").replace(/([a-z0-9])([A-Z])/g, "$1 $2").toLowerCase();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

/** `config.queue` → "Config · Queue", `jobId` → "Job id", `is_public` → "Is public". */
export function fieldLabel(field: Pick<FieldSchema, "name">): string {
  return field.name.split(".").map(words).join(" · ");
}

export function isEmpty(value: FormValue | undefined): boolean {
  return value === null || value === undefined || (typeof value === "string" && value.trim() === "");
}

function readPath(source: Readonly<Record<string, unknown>>, path: readonly string[]): unknown {
  return path.reduce<unknown>((current, key) => {
    if (typeof current !== "object" || current === null) return undefined;
    return (current as Record<string, unknown>)[key];
  }, source);
}

function textFor(field: FieldSchema, value: unknown): string {
  if (value === null || value === undefined) return "";
  if (field.kind === "string-list") return Array.isArray(value) ? value.map(String).join("\n") : "";
  if (field.kind === "json") return typeof value === "object" ? JSON.stringify(value, null, 2) : "";
  return typeof value === "object" ? JSON.stringify(value) : String(value);
}

function initialFor(field: FormField, prefill?: Readonly<Record<string, unknown>>): FormValue {
  const value = prefill ? readPath(prefill, field.path) : undefined;
  if (field.kind === "file") return null;
  if (field.kind === "boolean") {
    if (typeof value === "boolean") return value;
    return field.required && field.section === "body" && !prefill ? false : null;
  }
  return textFor(field, value);
}

/**
 * Starting values: from the item's attributes for an update (matched by path),
 * empty for a create. A required boolean on a create starts as `false` so the
 * request always carries it; every other boolean waits to be touched.
 */
export function initialValues(
  fields: readonly FormField[],
  prefill?: Readonly<Record<string, unknown>>,
): FormValues {
  return Object.fromEntries(fields.map((field) => [field.name, initialFor(field, prefill)]));
}

export function setValue(values: FormValues, name: string, value: FormValue): FormValues {
  return { ...values, [name]: value };
}
