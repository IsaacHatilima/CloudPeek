import { RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";

import { Touchable } from "@/components/touchable";
import { typography } from "@/theme/design";

import type { ColorPalette } from "@/theme/types";

import type { KeyValueRow } from "../usage-presenters";

/** A grouped card of label/value rows, for reports rather than lists. */
export function KeyValueList({
  colors,
  rows,
  title,
  isRefetching = false,
  onRefresh,
  refreshFailed = false,
}: {
  colors: ColorPalette;
  rows: readonly KeyValueRow[];
  /** Optional: the shell header already names the screen, so reports leave it out. */
  title?: string;
  isRefetching?: boolean;
  onRefresh?: () => void;
  refreshFailed?: boolean;
}) {
  return (
    <ScrollView contentContainerStyle={styles.content} contentInsetAdjustmentBehavior="automatic"
      refreshControl={onRefresh ? <RefreshControl refreshing={isRefetching} onRefresh={onRefresh} tintColor={colors.muted} /> : undefined}>
      {refreshFailed && onRefresh ? <Touchable accessibilityRole="button" onPress={onRefresh} style={{ padding: 16, borderRadius: 16, backgroundColor: colors.accentSoft }}>
        <Text style={[typography.caption, { color: colors.link }]}>Couldn’t refresh. Showing saved results. Tap to retry.</Text>
      </Touchable> : null}
      {title ? (
        <Text selectable style={[styles.title, { color: colors.text }]}>
          {title}
        </Text>
      ) : null}
      <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
        {rows.map((row) => (
          <View
            key={row.id}
            style={styles.row}
          >
            <Text style={[styles.label, { color: colors.muted }]}>{row.label}</Text>
            <Text selectable style={[styles.value, { color: colors.text }]}>
              {row.value}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 12,
    paddingBottom: 40,
    paddingHorizontal: 24,
    paddingTop: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    letterSpacing: -0.7,
  },
  card: {
    borderCurve: "continuous",
    borderRadius: 24,
    overflow: "hidden",
  },
  row: {
    gap: 4,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  value: {
    fontSize: 22,
    fontVariant: ["tabular-nums"],
    fontWeight: "600",
  },
});
