/**
 * `/action`: one form sheet for every Cloud write that needs input. The
 * operation and its known path params arrive as route params; an update also
 * names the item to prefill from, read from its detail endpoint. The root is
 * the ScrollView itself, which react-native-screens' form sheet requires.
 */
import { useLocalSearchParams } from "expo-router";
import { ActivityIndicator, ScrollView, StyleSheet, Text } from "react-native";

import { findResource } from "@/features/cloud-resources/catalog";
import { resolveScope } from "@/features/cloud-resources/scope";
import type { CloudEndpoint } from "@/features/cloud-resources/types";
import { useResourceItem } from "@/features/resources/detail/use-resource-item";
import { StateMessage } from "@/features/resources/components/state-message";
import { InlineNotice } from "@/components/inline-notice";
import { useWorkspaceSelection } from "@/features/workspace/use-workspace";
import type { WriteOperation } from "@/services/cloud-api/operation-types";
import { describeApiError } from "@/services/cloud-api/client";
import { typography } from "@/theme/design";
import { useAppTheme } from "@/theme/use-app-theme";
import type { ColorPalette } from "@/theme/types";

import { isDestructive } from "./action-catalog";
import { type ActionRoute, findOperation, parseActionRoute } from "./action-route";
import { FormField } from "./components/form-field";
import { FormSubmit } from "./components/form-submit";
import { useActionForm } from "./hooks/use-action-form";

export function ActionFormScreen() {
  const search = useLocalSearchParams<Record<string, string | string[]>>();
  const { colors } = useAppTheme();
  const route = parseActionRoute(search);
  const op = route ? findOperation(route.operationId) : null;

  if (!route || !op) {
    return (
      <Sheet colors={colors}>
        <Text style={[typography.title, { color: colors.text }]}>Nothing to do</Text>
        <Text style={[typography.body, { color: colors.muted }]}>
          This link does not name a Laravel Cloud operation Cloud Peek knows.
        </Text>
      </Sheet>
    );
  }

  if (route.mode === "update" && route.resourceId && route.itemId) {
    return <PrefilledForm colors={colors} itemId={route.itemId} op={op} route={route} />;
  }
  return <ActionForm colors={colors} op={op} route={route} />;
}

/** Waits for the item's attributes so the update form starts from current values. */
function PrefilledForm({
  colors,
  itemId,
  op,
  route,
}: {
  colors: ColorPalette;
  itemId: string;
  op: WriteOperation;
  route: ActionRoute;
}) {
  const selection = useWorkspaceSelection();
  const item = route.resourceId ? findResource(route.resourceId) : undefined;
  const resolution = item ? resolveScope(item.scope, selection, route.parentId) : null;

  if (!item?.endpoint || !resolution?.satisfied) {
    return <Sheet colors={colors}><StateMessage colors={colors} title="Select the resource first"
      body="Close this form and select its organization and parent resource before editing." /></Sheet>;
  }
  return (
    <LoadedForm
      colors={colors}
      endpoint={item.endpoint}
      itemId={itemId}
      op={op}
      params={resolution.params}
      route={route}
    />
  );
}

function LoadedForm({
  colors,
  endpoint,
  itemId,
  op,
  params,
  route,
}: {
  colors: ColorPalette;
  endpoint: CloudEndpoint;
  itemId: string;
  op: WriteOperation;
  params: Record<string, string>;
  route: ActionRoute;
}) {
  const state = useResourceItem(endpoint, params, itemId);

  if (state.kind === "loading") {
    return (
      <Sheet colors={colors}>
        <ActivityIndicator color={colors.accent} style={styles.spinner} />
      </Sheet>
    );
  }
  if (state.kind !== "ready") {
    return <Sheet colors={colors}><StateMessage colors={colors} title="Could not load current values"
      body={state.kind === "error" ? describeApiError(state.error) : "Close this form and reconnect or refresh the resource before editing."}
      action={"refetch" in state ? { label: "Try again", onPress: state.refetch } : undefined} /></Sheet>;
  }
  return <ActionForm colors={colors} op={op} prefill={state.attributes} route={route} />;
}

function ActionForm({
  colors,
  op,
  prefill,
  route,
}: {
  colors: ColorPalette;
  op: WriteOperation;
  prefill?: Readonly<Record<string, unknown>>;
  route: ActionRoute;
}) {
  const form = useActionForm(route, op, prefill);

  return (
    <Sheet colors={colors}>
      <Text style={[typography.title, { color: colors.text }]}>{op.summary}</Text>
      {op.description ? (
        <Text selectable style={[typography.body, { color: colors.muted }]}>
          {op.description}
        </Text>
      ) : null}
      {form.optionsLoading ? <Text style={[typography.caption, { color: colors.muted }]}>Loading supported database versions…</Text> : null}
      {form.optionsError ? <InlineNotice colors={colors} onPress={form.reloadOptions} message="Couldn’t load database versions. Tap to retry, or enter a supported version from Laravel Cloud." /> : null}
      {form.fields.map((field) => (
        <FormField
          colors={colors}
          error={form.errors[field.name]}
          field={field}
          key={field.name}
          onChange={(value) => form.update(field.name, value)}
          value={form.values[field.name]}
        />
      ))}
      <FormSubmit
        colors={colors}
        destructive={isDestructive(op)}
        failure={form.failure}
        label={op.summary}
        onPress={() => void form.submit()}
        pending={form.pending}
      />
    </Sheet>
  );
}

function Sheet({ children, colors }: { children: React.ReactNode; colors: ColorPalette }) {
  return (
    <ScrollView
      automaticallyAdjustKeyboardInsets
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      style={[styles.root, { backgroundColor: colors.surfaceBackground }]}
    >
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    gap: 24,
    paddingBottom: 48,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  spinner: {
    paddingTop: 40,
  },
});
