import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";

import { actionHref } from "@/features/actions/action-route";
import { confirmAction, reportFailure } from "@/features/actions/confirm-action";
import { useWriteAction } from "@/features/actions/hooks/use-write-action";

import { type DetailAction, detailActions } from "./detail-model";

type DetailActionsInput = {
  itemId: string;
  parentId?: string;
  resourceId: string;
  scopeParams: Readonly<Record<string, string>>;
  /** What the confirmation names, usually the item's title. */
  subject: string;
};

/**
 * The item's actions and how each one runs: a form sheet when input is
 * needed, otherwise a native confirmation followed by the request. A delete
 * that succeeds leaves the detail screen, since the item is gone.
 */
export function useDetailActions({ itemId, parentId, resourceId, scopeParams, subject }: DetailActionsInput) {
  const router = useRouter();
  const mutation = useWriteAction();
  const [runningId, setRunningId] = useState<string | null>(null);
  const actions = useMemo(
    () => detailActions(resourceId, scopeParams, itemId),
    [itemId, resourceId, scopeParams],
  );

  const run = useCallback(
    async (action: DetailAction) => {
      setRunningId(action.id);
      try {
        await mutation.mutateAsync({ input: { params: action.params }, op: action.op });
        if (action.kind === "remove") router.back();
      } catch (error) {
        reportFailure(action.op, error);
      } finally {
        setRunningId(null);
      }
    },
    [mutation, router],
  );

  const trigger = useCallback(
    (action: DetailAction) => {
      if (action.input) {
        router.push(
          actionHref({
            itemId,
            mode: action.kind === "update" ? "update" : "create",
            operationId: action.op.operationId,
            params: action.params,
            parentId,
            resourceId,
          }),
        );
        return;
      }
      confirmAction(action.op, subject, () => void run(action));
    },
    [itemId, parentId, resourceId, router, run, subject],
  );

  return { actions, runningId, trigger } as const;
}
