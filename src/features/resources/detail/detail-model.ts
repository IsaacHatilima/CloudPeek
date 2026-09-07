/**
 * One item's detail screen, as data: the attribute rows, the child resources
 * reached from it, and the write actions that apply to it. Pure, so it is
 * tested without rendering.
 */
import { isDestructive, needsInput, resourceActions } from "@/features/actions/action-catalog";
import { findResource } from "@/features/cloud-resources/catalog";
import type { ResourceId, ResourceMenuItem } from "@/features/cloud-resources/types";
import type { WriteOperation } from "@/services/cloud-api/operation-types";

import { indexIncluded, presentResource, type RowModel } from "../presenters";

export { attributeRows } from "./attribute-presenter";

/** Lists that hang off one item of another resource (chosen on screen, not in the header). */
export const CHILD_RESOURCES: Readonly<Partial<Record<ResourceId, readonly ResourceId[]>>> = {
  "database-clusters": ["databases", "database-snapshots", "database-restores"],
  instances: ["background-processes"],
  "object-storage-buckets": ["bucket-keys"],
  "websocket-clusters": ["websocket-applications"],
};

export type DetailActionKind = "command" | "remove" | "update";

export type DetailAction = {
  destructive: boolean;
  id: string;
  /** True when a form is needed first; false means a confirmation is enough. */
  input: boolean;
  kind: DetailActionKind;
  label: string;
  op: WriteOperation;
  params: Readonly<Record<string, string>>;
};

export type ChildLink = {
  /** The child's create operation, opened directly when the child has no list. */
  create: WriteOperation | null;
  item: ResourceMenuItem;
  listable: boolean;
};

export type LocatedItem = { attributes: Readonly<Record<string, unknown>>; row: RowModel };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/** Finds one resource in a list answer (or a single answer) and presents it. */
export function locateItem(
  answer: { data: unknown; included?: readonly unknown[] } | undefined,
  itemId: string,
): LocatedItem | null {
  if (!answer) return null;
  const items = Array.isArray(answer.data) ? answer.data : [answer.data];
  const index = items.findIndex((item) => isRecord(item) && item.id === itemId);
  if (index === -1) return null;

  const raw = items[index] as Record<string, unknown>;
  const attributes = isRecord(raw.attributes) ? raw.attributes : {};
  return { attributes, row: presentResource(raw, index, indexIncluded(answer.included ?? [])) };
}

export function childLinks(resourceId: string): readonly ChildLink[] {
  return (CHILD_RESOURCES[resourceId as ResourceId] ?? []).flatMap((childId) => {
    const item = findResource(childId);
    if (!item) return [];
    return [{ create: resourceActions(childId).create, item, listable: item.endpoint !== null }];
  });
}

function toAction(
  op: WriteOperation,
  kind: DetailActionKind,
  params: Readonly<Record<string, string>>,
): DetailAction {
  return {
    destructive: isDestructive(op),
    id: op.operationId,
    input: needsInput(op, params),
    kind,
    label: op.summary,
    op,
    params,
  };
}

/** Update first, then the item's commands, delete last; each with the params it needs. */
export function detailActions(
  resourceId: string,
  scopeParams: Readonly<Record<string, string>>,
  itemId: string,
): readonly DetailAction[] {
  const actions = resourceActions(resourceId);
  if (!actions.idParam) return [];
  const params = { ...scopeParams, [actions.idParam]: itemId };

  return [
    ...(actions.update ? [toAction(actions.update, "update", params)] : []),
    ...actions.commands.map((op) => toAction(op, "command", params)),
    ...(actions.remove ? [toAction(actions.remove, "remove", params)] : []),
  ];
}
