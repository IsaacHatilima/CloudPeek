/**
 * The `/action` sheet's address. Everything the form needs travels as route
 * params, so the sheet can be reopened, deep-linked, and restored: which
 * operation, the path params already known, and (for an update) which item
 * to prefill from.
 */
import { WRITE_OPERATIONS } from "@/services/cloud-api/write-operations.generated";
import type { WriteOperation } from "@/services/cloud-api/operation-types";

import type { FormMode } from "./form-model";

export const ACTION_PATHNAME = "/action";

export type ActionRoute = {
  /** The item an update prefills from; with `resourceId`, locates it in the cached list. */
  itemId?: string;
  mode: FormMode;
  operationId: string;
  params: Readonly<Record<string, string>>;
  parentId?: string;
  resourceId?: string;
};

export type ActionHref = { params: Record<string, string>; pathname: typeof ACTION_PATHNAME };

type SearchParams = Readonly<Record<string, string | string[] | undefined>>;

function compact(entries: Record<string, string | undefined>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(entries).filter((entry): entry is [string, string] => entry[1] !== undefined),
  );
}

export function actionHref(route: ActionRoute): ActionHref {
  return {
    params: compact({
      itemId: route.itemId,
      mode: route.mode,
      operationId: route.operationId,
      params: JSON.stringify(route.params),
      parentId: route.parentId,
      resourceId: route.resourceId,
    }),
    pathname: ACTION_PATHNAME,
  };
}

function single(value: string | string[] | undefined): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function parseParams(raw: string | undefined): Readonly<Record<string, string>> | null {
  if (raw === undefined) return {};
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return null;
    const entries = Object.entries(parsed);
    return entries.every(([, value]) => typeof value === "string")
      ? (parsed as Record<string, string>)
      : null;
  } catch {
    return null;
  }
}

export function findOperation(operationId: string | undefined): WriteOperation | null {
  return WRITE_OPERATIONS.find((op) => op.operationId === operationId) ?? null;
}

/** Validates route params back into an ActionRoute; null when anything is off. */
export function parseActionRoute(search: SearchParams): ActionRoute | null {
  const operationId = single(search.operationId);
  const params = parseParams(single(search.params));
  const mode = single(search.mode) ?? "create";
  if (!operationId || !findOperation(operationId) || !params) return null;
  if (mode !== "create" && mode !== "update") return null;

  return {
    itemId: single(search.itemId),
    mode,
    operationId,
    params,
    parentId: single(search.parentId),
    resourceId: single(search.resourceId),
  };
}
