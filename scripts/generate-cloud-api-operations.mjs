// Generates src/services/cloud-api/write-operations.generated.ts from the
// vendored Laravel Cloud OpenAPI document: every POST/PATCH/PUT/DELETE, with
// its request body reduced to the flat field list the action forms render.
// Runs as part of `pnpm run api:types`.
//
// Reduction rules (see operation-types.ts for the target shape):
//   - `$ref`s are resolved; `anyOf`/`oneOf` with a `null` branch mark the field nullable
//     and the first non-null branch is used (`oneOf` between objects becomes a JSON field).
//   - objects with properties are flattened one level (`config.queue`); anything deeper,
//     arrays of objects, and `oneOf` objects become a JSON field with a sample document.
//   - `string` + `binary` format is a file; arrays of strings are string lists.
//   - operations tagged "Databases (Legacy)" are skipped: Cloud marks them deprecated.
import { readFileSync, writeFileSync } from "node:fs";

const SOURCE = new URL("../contracts/laravel-cloud-openapi.json", import.meta.url);
const TARGET = new URL("../src/services/cloud-api/write-operations.generated.ts", import.meta.url);
const WRITE_METHODS = ["post", "patch", "put", "delete"];
const SKIPPED_TAGS = new Set(["Databases (Legacy)"]);

const spec = JSON.parse(readFileSync(SOURCE, "utf8"));
const schemas = spec.components?.schemas ?? {};

function resolve(node) {
  if (!node || typeof node !== "object") return node;
  if (!node.$ref) return node;
  const name = node.$ref.split("/").pop();
  const target = schemas[name];
  if (!target) throw new Error(`unknown schema ${node.$ref}`);
  // Keep wrapper-level description/examples: the spec annotates some $refs in place.
  const { $ref, ...wrapper } = node;
  return { ...resolve(target), ...compact(wrapper) };
}

function compact(object) {
  return Object.fromEntries(Object.entries(object).filter(([, value]) => value !== undefined));
}

function isNull(branch) {
  const resolved = resolve(branch);
  return resolved?.type === "null" || (Array.isArray(resolved?.type) && resolved.type.length === 1 && resolved.type[0] === "null");
}

/** Picks the effective schema and whether null is allowed. */
function effective(schema) {
  const resolved = resolve(schema);
  const branches = resolved.anyOf ?? resolved.oneOf;
  let nullable = Array.isArray(resolved.type) && resolved.type.includes("null");

  if (Array.isArray(branches) && branches.length > 0) {
    const real = branches.filter((branch) => !isNull(branch));
    nullable = nullable || real.length < branches.length;
    if (real.length === 1) {
      const { anyOf, oneOf, ...rest } = resolved;
      return effectiveWith({ ...compact(rest), ...resolve(real[0]) }, nullable);
    }
    if (resolved.oneOf) return { nullable, schema: { ...resolved, oneOf: real }, variants: real.map(resolve) };
    // anyOf between several real branches: prefer the most specific (an enum or integer) branch.
    const preferred = real.map(resolve).find((branch) => branch.enum || branch.type === "integer") ?? resolve(real[0]);
    const { anyOf, ...rest } = resolved;
    return effectiveWith({ ...compact(rest), ...preferred }, nullable || real.some((b) => Array.isArray(resolve(b).type) && resolve(b).type.includes("null")));
  }
  return effectiveWith(resolved, nullable);
}

function effectiveWith(schema, nullable) {
  const type = Array.isArray(schema.type) ? schema.type.find((t) => t !== "null") : schema.type;
  return { nullable, schema: { ...schema, type } };
}

function sample(schema) {
  const { schema: s, variants } = effective(schema);
  if (variants) return sample(variants[0]);
  if (s.examples?.length) return s.examples[0];
  if (s.example !== undefined) return s.example;
  if (s.enum) return s.enum[0];
  if (s.type === "object" && s.properties) {
    return Object.fromEntries(Object.entries(s.properties).map(([key, value]) => [key, sample(value)]));
  }
  if (s.type === "array") return [sample(s.items ?? { type: "string" })];
  if (s.type === "integer" || s.type === "number") return s.minimum ?? 1;
  if (s.type === "boolean") return true;
  return s.format === "date-time" ? "2026-01-01T00:00:00Z" : "value";
}

function example(schema) {
  const value = sample(schema);
  return typeof value === "string" ? value : JSON.stringify(value);
}

function base(name, path, s, required, nullable) {
  const description = s.description?.trim();
  return compact({
    description: description || undefined,
    format: s.format,
    max: s.maximum,
    maxLength: s.maxLength,
    min: s.minimum,
    minLength: s.minLength,
    name,
    nullable,
    path,
    pattern: s.pattern,
    required,
  });
}

function jsonField(name, path, s, required, nullable, variants) {
  const titles = variants?.map((variant) => variant.title).filter(Boolean);
  const note = titles?.length ? `One of: ${titles.join(", ")}.` : undefined;
  const description = [s.description?.trim(), note].filter(Boolean).join(" ");
  return compact({
    ...base(name, path, { ...s, description }, required, nullable),
    example: example(variants ? variants[0] : s),
    kind: "json",
  });
}

function fields(name, path, schema, required, depth = 0) {
  const { nullable, schema: s, variants } = effective(schema);

  if (variants) return [jsonField(name, path, s, required, nullable, variants)];
  if (s.enum) {
    const numeric = s.enum.every((value) => typeof value === "number");
    return [compact({ ...base(name, path, s, required, nullable), kind: "enum", numeric: numeric || undefined, options: s.enum.map(String) })];
  }
  if (s.type === "string") {
    const kind = s.format === "binary" ? "file" : "string";
    return [compact({ ...base(name, path, s, required, nullable), example: s.examples?.[0] !== undefined ? String(s.examples[0]) : undefined, kind })];
  }
  if (s.type === "integer" || s.type === "number") {
    return [compact({ ...base(name, path, s, required, nullable), example: s.examples?.[0] !== undefined ? String(s.examples[0]) : undefined, kind: s.type })];
  }
  if (s.type === "boolean") return [{ ...base(name, path, s, required, nullable), kind: "boolean" }];
  if (s.type === "array") {
    const item = effective(s.items ?? { type: "string" }).schema;
    if (item.type === "string" || item.enum) {
      return [compact({ ...base(name, path, s, required, nullable), kind: "string-list", options: item.enum?.map(String) })];
    }
    return [jsonField(name, path, s, required, nullable)];
  }
  if (s.type === "object" && s.properties && depth === 0) {
    const inner = new Set(s.required ?? []);
    return Object.entries(s.properties).flatMap(([key, value]) =>
      fields(`${name}.${key}`, [...path, key], value, required && inner.has(key), depth + 1),
    );
  }
  return [jsonField(name, path, s, required, nullable)];
}

function bodyOf(operation) {
  const content = operation.requestBody?.content;
  if (!content) return null;
  const [mediaType, media] = Object.entries(content)[0];
  const schema = resolve(media.schema ?? {});
  const required = new Set(schema.required ?? []);
  const properties = Object.entries(schema.properties ?? {}).filter(([key]) => key !== "");
  return {
    contentType: mediaType.startsWith("multipart/") ? "multipart" : "json",
    fields: properties.flatMap(([key, value]) => fields(key, [key], value, required.has(key))),
  };
}

function queryOf(operation) {
  return (operation.parameters ?? [])
    .filter((parameter) => parameter.in === "query")
    .flatMap((parameter) => {
      const schema = { ...(parameter.schema ?? { type: "string" }), description: parameter.description };
      return fields(parameter.name, [parameter.name], schema, Boolean(parameter.required));
    });
}

function pathParams(path) {
  return [...path.matchAll(/\{([^}]+)\}/g)].map((match) => match[1]);
}

const operations = [];
for (const [path, item] of Object.entries(spec.paths)) {
  for (const method of WRITE_METHODS) {
    const operation = item[method];
    if (!operation || (operation.tags ?? []).some((tag) => SKIPPED_TAGS.has(tag))) continue;
    operations.push(compact({
      body: bodyOf(operation),
      description: operation.description?.trim() || undefined,
      method: method.toUpperCase(),
      operationId: operation.operationId,
      params: pathParams(path),
      path,
      query: queryOf(operation),
      summary: operation.summary?.trim() ?? operation.operationId,
      tag: operation.tags?.[0] ?? "Other",
    }));
  }
}

const banner = `// Generated by scripts/generate-cloud-api-operations.mjs from contracts/laravel-cloud-openapi.json.
// Do not edit by hand; run \`pnpm run api:types\`.
import type { WriteOperation } from "./operation-types";

export const WRITE_OPERATIONS: readonly WriteOperation[] = `;
writeFileSync(TARGET, `${banner}${JSON.stringify(operations, null, 2)};\n`);
console.log(`wrote ${TARGET.pathname} (${operations.length} operations)`);
