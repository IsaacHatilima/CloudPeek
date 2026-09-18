import { readFileSync } from "node:fs";

/** Preserve the downloaded document; correct known generator placeholders in memory. */
export function readContract() {
  const spec = JSON.parse(readFileSync(new URL("../contracts/laravel-cloud-openapi.json", import.meta.url), "utf8"));
  const version = spec.components?.schemas?.StoreDatabaseRequest?.properties?.version;
  // The docs require a version from GET /databases/types. [""] is a schema
  // generation placeholder, not an allowed database version.
  if (version?.enum?.length === 1 && version.enum[0] === "") {
    delete version.enum;
    version.description = "Choose a version supported by the selected database type.";
  }
  return spec;
}
