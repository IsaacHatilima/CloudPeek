import { useMemo, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import type { SymbolViewProps } from "expo-symbols";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { FAB_SIZE } from "@/components/floating-action-button";
import { SearchField } from "@/components/search-field";
import { Touchable } from "@/components/touchable";
import { describeApiError } from "@/services/cloud-api/client";
import { typography } from "@/theme/design";
import type { ColorPalette } from "@/theme/types";

import type { RowModel } from "../presenters";
import { filterResourceRows } from "../resource-list-model";
import { ResourceRow } from "./resource-row";
import { ResourceSkeleton } from "./resource-skeleton";
import { StateMessage } from "./state-message";

type ResourceListProps = {
  colors: ColorPalette;
  error: unknown;
  hasFloatingAction?: boolean;
  icon?: SymbolViewProps["name"];
  isLoading: boolean;
  isRefetching: boolean;
  label: string;
  onPressRow?: (row: RowModel) => void;
  onRefresh: () => void;
  rows: readonly RowModel[];
};

export function ResourceList({ colors, error, hasFloatingAction = false, icon, isLoading, isRefetching, label, onPressRow, onRefresh, rows }: ResourceListProps) {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState("");
  const filtered = useMemo(() => filterResourceRows(rows, search), [rows, search]);
  if (isLoading && rows.length === 0) return <ResourceSkeleton colors={colors} />;
  if (error && rows.length === 0) return (
    <StateMessage action={{ label: "Try again", onPress: onRefresh }} body={describeApiError(error)} colors={colors}
      icon={{ ios: "wifi.exclamationmark", android: "wifi_off", web: "wifi_off" }} title={`Couldn't load ${label.toLowerCase()}`} />
  );

  return (
    <View style={styles.root}>
      {rows.length > 0 ? <View style={styles.toolbar}>
        <SearchField colors={colors} label={`Filter loaded ${label.toLowerCase()}`} onChange={setSearch} value={search} />
        <View style={styles.summary}>
          <Text style={[typography.caption, { color: colors.muted }]}>{search.trim() ? `${filtered.length} of ${rows.length} shown` : `${rows.length} loaded`}</Text>
          <Text accessibilityLiveRegion="polite" style={[typography.caption, { color: colors.muted }]}>{isRefetching ? "Refreshing…" : "Pull to refresh"}</Text>
        </View>
      </View> : null}
      {error ? <Touchable accessibilityRole="button" onPress={onRefresh} style={[styles.retry, { backgroundColor: colors.accentSoft }]}>
        <Text style={[typography.caption, { color: colors.link }]}>Couldn’t refresh. Showing saved results. Tap to retry.</Text>
      </Touchable> : null}
      <FlatList
        ListEmptyComponent={<StateMessage colors={colors} icon={icon ?? { ios: "magnifyingglass", android: "search", web: "search" }}
          title={search.trim() ? "No matches" : `No ${label.toLowerCase()} yet`}
          body={search.trim() ? "Try a different name or status in the loaded results." : "Nothing here for this selection. Pull down to check again."}
          action={search.trim() ? { label: "Clear search", onPress: () => setSearch("") } : undefined} />}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + (hasFloatingAction ? FAB_SIZE + 40 : 24) }, filtered.length === 0 && styles.empty]}
        contentInsetAdjustmentBehavior="automatic" data={filtered} keyboardDismissMode="on-drag" keyboardShouldPersistTaps="handled"
        keyExtractor={(row) => row.id} refreshControl={<RefreshControl onRefresh={onRefresh} refreshing={isRefetching} tintColor={colors.muted} />}
        renderItem={({ item }) => <ResourceRow colors={colors} icon={icon} onPress={onPressRow ? () => onPressRow(item) : undefined} row={item} />}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  root: { flex: 1 },
  toolbar: { gap: 12, paddingHorizontal: 24, paddingBottom: 12 },
  summary: { flexDirection: "row", justifyContent: "space-between", gap: 12, paddingHorizontal: 4 },
  content: { gap: 12, paddingHorizontal: 24, paddingTop: 4 },
  empty: { flexGrow: 1 },
  retry: { borderRadius: 16, marginHorizontal: 24, marginBottom: 12, padding: 16 },
});
