/**
 * Multipart bodies for the one Cloud operation that takes a file (the
 * application avatar). React Native's FormData sends a `{ uri, name, type }`
 * part as the file at that URI; every other value is appended as text.
 */
export type FilePart = { mimeType?: string; name: string; uri: string };

const DEFAULT_MIME_TYPE = "application/octet-stream";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function isFilePart(value: unknown): value is FilePart {
  return isRecord(value) && typeof value.uri === "string" && typeof value.name === "string";
}

function partFor(value: unknown): Blob | string {
  if (isFilePart(value)) {
    const part = { name: value.name, type: value.mimeType ?? DEFAULT_MIME_TYPE, uri: value.uri };
    return part as unknown as Blob;
  }
  return typeof value === "object" ? JSON.stringify(value) : String(value);
}

export function toFormData(body: Readonly<Record<string, unknown>>): FormData {
  const form = new FormData();
  for (const [key, value] of Object.entries(body)) {
    if (value === null || value === undefined) continue;
    form.append(key, partFor(value));
  }
  return form;
}
