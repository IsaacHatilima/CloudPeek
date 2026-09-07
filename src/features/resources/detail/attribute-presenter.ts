import { displayLabel } from "@/lib/display-label";
import { formatDateTime, isDateTimeField } from "@/lib/format-date-time";
import type { KeyValueRow } from "@/features/usage/usage-presenters";

import { presentRepository } from "./repository";

export type AttributeRow = KeyValueRow & {
  children?: readonly AttributeRow[];
  detail?: string;
  href?: string;
  masked?: boolean;
  multiline?: boolean;
};
const MASK = "••••••••";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function environmentVariablesText(value: unknown): string | null {
  if (value === null || value === undefined || value === "") return null;
  if (Array.isArray(value)) {
    return value.length ? value.map((variable) => {
      const key = isRecord(variable) && typeof variable.key === "string" ? variable.key : null;
      return key ? `${key} = ${MASK}` : MASK;
    }).join("\n") : null;
  }
  if (isRecord(value)) {
    const keys = Object.keys(value);
    return keys.length ? keys.map((key) => `${key} = ${MASK}`).join("\n") : null;
  }
  return MASK;
}

function scalarText(value: unknown, key: string): string {
  if (value === null || value === undefined || value === "") return "Not set";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return isDateTimeField(key) ? formatDateTime(String(value)) : String(value);
}

function labelFor(key: string): string {
  if (key === "4xx") return "4xx responses";
  if (key === "429") return "HTTP 429 responses";
  return displayLabel(key);
}

function presentAttribute(key: string, value: unknown, path: readonly string[], provider?: unknown): AttributeRow | null {
  const id = [...path, key].join(".");
  const label = labelFor(key);
  if (key === "avatar_url") return null;
  if (key === "environment_variables") {
    const text = environmentVariablesText(value);
    return text === null ? null : { id, label, value: text, masked: true };
  }
  if (key === "repository") {
    const repository = presentRepository(value, provider);
    if (repository) return {
      id, label, value: repository.name,
      ...(repository.href ? { href: repository.href } : {}),
      ...(repository.branch ? { detail: `Default branch · ${repository.branch}` } : {}),
    };
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return path.length ? { id, label, value: "None" } : null;
    if (value.every((entry) => !isRecord(entry) && !Array.isArray(entry))) {
      return { id, label, value: value.map((entry) => scalarText(entry, key)).join(", ") };
    }
    const children = value.flatMap((entry, index) => {
      const row = presentAttribute(`item_${index + 1}`, entry, [...path, key]);
      return row ? [row] : [];
    });
    return { id, label, value: "", children };
  }
  if (isRecord(value)) {
    const children = Object.entries(value).flatMap(([childKey, entry]) => {
      const row = presentAttribute(childKey, entry, [...path, key]);
      return row ? [row] : [];
    });
    return children.length ? { id, label, value: "", children } : { id, label, value: "None" };
  }
  if ((value === null || value === undefined || value === "") && path.length === 0) return null;
  const text = scalarText(value, key);
  return { id, label, value: text, ...(typeof value === "string" && value.includes("\n") ? { multiline: true } : {}) };
}

/** Human-readable display only. Original attributes remain intact for API forms. */
export function attributeRows(attributes: Readonly<Record<string, unknown>>): readonly AttributeRow[] {
  return Object.entries(attributes).flatMap(([key, value]) => {
    const row = presentAttribute(key, value, [], attributes.source_control_provider_type);
    return row ? [row] : [];
  });
}
