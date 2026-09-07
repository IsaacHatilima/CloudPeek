/**
 * Field-by-field validation against the OpenAPI constraints: required, enum
 * membership, numeric ranges, string lengths and patterns, JSON syntax.
 * Returns one message per failing field, keyed by field name.
 */
import type { FieldSchema } from "@/services/cloud-api/operation-types";

import { type FormField, type FormValue, type FormValues, isEmpty } from "./form-model";

export type FormErrors = Readonly<Record<string, string>>;

export const REQUIRED_MESSAGE = "Required";

export function listEntries(text: string): readonly string[] {
  return text
    .split(/[\n,]/)
    .map((entry) => entry.trim())
    .filter((entry) => entry !== "");
}

function numberError(field: FieldSchema, text: string): string | null {
  const whole = field.kind === "integer";
  if (whole ? !/^-?\d+$/.test(text) : !Number.isFinite(Number(text))) {
    return whole ? "Enter a whole number" : "Enter a number";
  }
  const value = Number(text);
  if (field.min !== undefined && value < field.min) return `Must be at least ${field.min}`;
  if (field.max !== undefined && value > field.max) return `Must be at most ${field.max}`;
  return null;
}

function compile(source: string, flags: string): RegExp | null {
  try {
    return new RegExp(source, flags);
  } catch {
    return null;
  }
}

/**
 * Cloud's patterns are PCRE, where `\p{Latin}` names a script; JavaScript
 * needs `\p{Script=Latin}`. Tries the pattern as Unicode, then with script
 * names qualified, then without the flag; a pattern that still fails to
 * compile is not enforced rather than blocking the form.
 */
export function compilePattern(pattern: string): RegExp | null {
  const qualified = pattern.replace(/\\p\{([A-Za-z_]{3,})\}/g, "\\p{Script=$1}");
  return compile(pattern, "u") ?? compile(qualified, "u") ?? compile(pattern, "");
}

function matchesPattern(pattern: string, text: string): boolean {
  return compilePattern(pattern)?.test(text) ?? true;
}

function stringError(field: FieldSchema, text: string): string | null {
  if (field.minLength !== undefined && text.length < field.minLength) {
    return `At least ${field.minLength} characters`;
  }
  if (field.maxLength !== undefined && text.length > field.maxLength) {
    return `At most ${field.maxLength} characters`;
  }
  if (field.pattern && !matchesPattern(field.pattern, text)) {
    return "Does not match the required format";
  }
  return null;
}

function optionError(field: FieldSchema, entries: readonly string[]): string | null {
  if (!field.options) return null;
  const invalid = entries.find((entry) => !field.options?.includes(entry));
  return invalid === undefined ? null : `"${invalid}" is not one of the options`;
}

function jsonError(text: string): string | null {
  try {
    JSON.parse(text);
    return null;
  } catch {
    return "Enter valid JSON";
  }
}

function textError(field: FieldSchema, text: string): string | null {
  switch (field.kind) {
    case "integer":
    case "number":
      return numberError(field, text);
    case "enum":
      return optionError(field, [text]);
    case "string-list":
      return optionError(field, listEntries(text));
    case "json":
      return jsonError(text);
    case "string":
      return stringError(field, text);
    default:
      return null;
  }
}

export function fieldError(field: FormField, value: FormValue | undefined): string | null {
  if (isEmpty(value)) return field.required ? REQUIRED_MESSAGE : null;
  return typeof value === "string" ? textError(field, value.trim()) : null;
}

export function validateForm(fields: readonly FormField[], values: FormValues): FormErrors {
  return Object.fromEntries(
    fields.flatMap((field) => {
      const error = fieldError(field, values[field.name]);
      return error ? [[field.name, error]] : [];
    }),
  );
}
