import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";

import { describeApiError } from "@/services/cloud-api/client";
import type { WriteOperation } from "@/services/cloud-api/operation-types";

import type { ActionRoute } from "../action-route";
import {
  formFields,
  type FormValue,
  type FormValues,
  initialValues,
  setValue,
} from "../form-model";
import { buildRequest } from "../form-request";
import { type FormErrors, validateForm } from "../form-validation";
import { databaseFormFields } from "../database-options";
import { useDatabaseOptions } from "./use-database-options";
import { useWriteAction } from "./use-write-action";

const NO_ERRORS: FormErrors = {};

/**
 * One form's state: values, the errors shown once a submit was attempted, and
 * the submit itself, which sends the request and closes the sheet on success.
 * Mount it only once `prefill` is known; the initial values are read once.
 */
export function useActionForm(
  route: ActionRoute,
  op: WriteOperation,
  prefill?: Readonly<Record<string, unknown>>,
) {
  const router = useRouter();
  const mutation = useWriteAction();
  const baseFields = useMemo(() => formFields(op, route.params), [op, route.params]);
  const [initial] = useState(() => initialValues(baseFields, prefill));
  const [values, setValues] = useState<FormValues>(initial);
  const createsDatabase = op.operationId === "public.databases.clusters.store";
  const options = useDatabaseOptions(createsDatabase);
  const fields = useMemo(() => createsDatabase ? databaseFormFields(baseFields, values, options.data ?? []) : baseFields, [baseFields, createsDatabase, options.data, values]);
  const [submitted, setSubmitted] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);
  const errors = useMemo(() => validateForm(fields, values), [fields, values]);

  const update = useCallback((name: string, value: FormValue) => {
    setValues((current) => setValue(createsDatabase && name === "type" ? { ...current, version: "", region: "" } : current, name, value));
  }, [createsDatabase]);

  const submit = useCallback(async () => {
    setSubmitted(true);
    setFailure(null);
    if (Object.keys(errors).length > 0) return;
    try {
      await mutation.mutateAsync({ input: buildRequest(op, fields, values, initial, route.mode), op });
      router.back();
    } catch (error) {
      setFailure(describeApiError(error));
    }
  }, [errors, fields, initial, mutation, op, route.mode, router, values]);

  return {
    errors: submitted ? errors : NO_ERRORS,
    failure,
    fields,
    pending: mutation.isPending,
    optionsLoading: createsDatabase && options.isFetching,
    optionsError: createsDatabase ? options.error : null,
    reloadOptions: () => void options.refetch(),
    submit,
    update,
    values,
  } as const;
}
