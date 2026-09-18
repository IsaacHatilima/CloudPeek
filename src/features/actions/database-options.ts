import type { CloudEndpoint } from "@/features/cloud-resources/types";

import type { FormField, FormValues } from "./form-model";

export const DATABASE_TYPES_ENDPOINT: CloudEndpoint = {
  kind: "list", method: "GET", operationId: "public.databases.types", params: [], path: "/databases/types",
};

export type DatabaseTypeOption = { type: string; versions: string[]; regions: string[] };

export function databaseTypesFrom(data: readonly unknown[]): DatabaseTypeOption[] {
  return data.flatMap((value) => {
    if (!value || typeof value !== "object" || !("type" in value) || typeof value.type !== "string") return [];
    if (!("versions" in value) || !Array.isArray(value.versions) || !("regions" in value) || !Array.isArray(value.regions)) return [];
    const versions = value.versions.filter((entry): entry is string => typeof entry === "string" && entry !== "");
    const regions = value.regions.filter((entry): entry is string => typeof entry === "string" && entry !== "");
    // Retired types have no versions; new clusters use the versioned types.
    return versions.length ? [{ type: value.type, versions, regions }] : [];
  });
}

export function databaseFormFields(fields: readonly FormField[], values: FormValues, types: readonly DatabaseTypeOption[]): readonly FormField[] {
  const selected = types.find((option) => option.type === values.type);
  return fields.map((field) => {
    const options = field.name === "type" ? types.map((option) => option.type)
      : field.name === "version" ? selected?.versions
      : field.name === "region" ? selected?.regions : undefined;
    return options?.length ? { ...field, kind: "enum", options } : field;
  });
}
