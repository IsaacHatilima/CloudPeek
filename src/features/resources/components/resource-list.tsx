import { useMemo, useState } from "react";
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import type { SymbolViewProps } from "expo-symbols";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { FAB_SIZE } from "@/components/floating-action-button";
import { SearchField } from "@/components/search-field";
import { Touchable } from "@/components/touchable";
import { InlineNotice } from "@/components/inline-notice";
import { isAuthenticationError } from "@/services/cloud-api/errors";
import { typography } from "@/theme/design";
import type { ColorPalette } from "@/theme/types";

import type { RowModel } from "../presenters";
import { filterResourceRows } from "../resource-list-model";
import { ResourceRow } from "./resource-row";
import { ResourceSkeleton } from "./resource-skeleton";
import { StateMessage } from "./state-message";
import { ApiErrorState } from "./api-error-state";

type ResourceListProps = {
  colors: ColorPalette;
  error: unknown;
  hasFloatingAction?: boolean;
  icon?: SymbolViewProps["name"];
  isLoading: boolean;
  isRefetching: boolean;
  hasNextPage?: boolean;
  isLoadingMore?: boolean;
  loadMoreFailed?: boolean;
  label: string;
  onConnect?: () => void;
  onLoadMore?: () => void;
  onPressRow?: (row: RowModel) => void;
  onRefresh: () => void;
  rows: readonly RowModel[];
  total?: number;
};

export function ResourceList({ colors, error, hasFloatingAction = false, hasNextPage = false, icon, isLoading, isLoadingMore = false, isRefetching, label, loadMoreFailed = false, onConnect, onLoadMore, onPressRow, onRefresh, rows, total }: ResourceListProps) {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState("");
  const filtered = useMemo(() => filterResourceRows(rows, search), [rows, search]);
  if (isLoading && rows.length === 0) return <ResourceSkeleton colors={colors} />;
  if (error && (rows.length === 0 || isAuthenticationError(error))) return (
    <ApiErrorState colors={colors} error={error} onConnect={onConnect} onRetry={onRefresh} title={`Couldn't load ${label.toLowerCase()}`} />
  );

  return (
    <View style={styles.root}>
      {rows.length > 0 ? <View style={styles.toolbar}>
        <SearchField colors={colors} label={`Filter loaded ${label.toLowerCase()}`} onChange={setSearch} value={search} />
        <View style={styles.summary}>
          <Text accessibilityLiveRegion="polite" style={[typography.caption, { color: colors.muted }]}>{search.trim() ? `${filtered.length} matches in ${rows.length} loaded` : total !== undefined ? `${rows.length} of ${total} loaded` : `${rows.length} loaded`}</Text>
          <Text accessibilityLiveRegion="polite" style={[typography.caption, { color: colors.muted }]}>{isRefetching ? "Refreshing…" : "Pull to refresh"}</Text>
        </View>
      </View> : null}
      {error && !loadMoreFailed ? <View style={styles.notice}><InlineNotice colors={colors} onPress={onRefresh} message="Couldn’t refresh. Showing saved results. Tap to retry." /></View> : null}
      <FlatList
        ListEmptyComponent={<StateMessage colors={colors} icon={icon ?? { ios: "magnifyingglass", android: "search", web: "search" }}
          title={search.trim() ? "No matches" : `No ${label.toLowerCase()} yet`}
          body={search.trim() ? "Try a different name or status in the loaded results." : "Nothing here for this selection. Pull down to check again."}
          action={search.trim() ? { label: "Clear search", onPress: () => setSearch("") } : undefined} />}
        ListFooterComponent={hasNextPage && onLoadMore ? <View style={styles.footer}>
          {loadMoreFailed ? <Text accessibilityLiveRegion="polite" style={[typography.caption, { color: colors.muted }]}>The next page couldn’t be loaded. Your current results are still here.</Text> : null}
          <Touchable accessibilityRole="button" accessibilityState={{ busy: isLoadingMore, disabled: isLoadingMore || isRefetching }} disabled={isLoadingMore || isRefetching}
            onPress={onLoadMore} style={[styles.loadMore, { backgroundColor: colors.cardBackground }]}>
            {isLoadingMore ? <ActivityIndicator color={colors.link} /> : null}
            <Text style={[typography.label, { color: colors.link }]}>{isLoadingMore ? "Loading more…" : loadMoreFailed ? "Retry next page" : "Load more"}</Text>
          </Touchable>
        </View> : null}
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
  summary: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: 8, paddingHorizontal: 4 },
  content: { gap: 12, paddingHorizontal: 24, paddingTop: 4 },
  empty: { flexGrow: 1 },
  notice: { marginHorizontal: 24, marginBottom: 12 },
  footer: { gap: 12, paddingTop: 8 },
  loadMore: { alignItems: "center", borderRadius: 20, flexDirection: "row", gap: 12, justifyContent: "center", minHeight: 56, padding: 16 },
});
