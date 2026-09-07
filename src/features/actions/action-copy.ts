/** Words for confirmations, derived from the operation's own summary. */
import type { WriteOperation } from "@/services/cloud-api/operation-types";

/** "Delete application" → "Delete"; "Set the default managed queue" → "Set". */
export function verbOf(summary: string): string {
  const word = summary.trim().split(/\s+/)[0] || "Confirm";
  return word.charAt(0).toUpperCase() + word.slice(1);
}

/** Cloud's own description of the operation, then what it will act on. */
export function confirmMessage(op: WriteOperation, subject?: string): string {
  return [op.description, subject].filter(Boolean).join("\n\n");
}

export function successMessage(op: WriteOperation): string {
  return `${op.summary}: done.`;
}
