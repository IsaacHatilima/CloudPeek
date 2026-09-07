/** Native confirmation and failure alerts for writes that need no form. */
import { Alert } from "react-native";

import { describeApiError } from "@/services/cloud-api/client";
import type { WriteOperation } from "@/services/cloud-api/operation-types";

import { isDestructive } from "./action-catalog";
import { confirmMessage, verbOf } from "./action-copy";

export function confirmAction(op: WriteOperation, subject: string, onConfirm: () => void): void {
  Alert.alert(op.summary, confirmMessage(op, subject) || undefined, [
    { style: "cancel", text: "Cancel" },
    {
      onPress: onConfirm,
      style: isDestructive(op) ? "destructive" : "default",
      text: verbOf(op.summary),
    },
  ]);
}

export function reportFailure(op: WriteOperation, error: unknown): void {
  Alert.alert(`Could not ${op.summary.charAt(0).toLowerCase()}${op.summary.slice(1)}`, describeApiError(error));
}
