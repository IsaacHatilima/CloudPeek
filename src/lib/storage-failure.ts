/**
 * One message shape for every persistence failure. zustand's `persist` turns a
 * failed read into "nothing was stored", which looks exactly like a fresh
 * install, so a store that cannot read or write its own state fails invisibly
 * unless something says so. `console.warn` because the app keeps working; it
 * just forgets, and a selection that resets on every launch is otherwise an
 * undiagnosable bug report.
 */
export type StorageBackend = "file";

export type StorageOperation = "read" | "rehydrate" | "remove" | "write";

export function reportStorageFailure(
  backend: StorageBackend,
  operation: StorageOperation,
  name: string,
  error: unknown,
): void {
  const detail = error instanceof Error ? error.message : String(error);
  console.warn(`[storage] ${backend} ${operation} of "${name}" failed: ${detail}`);
}
