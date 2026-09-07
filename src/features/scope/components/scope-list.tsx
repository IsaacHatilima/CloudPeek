import { ActivityIndicator, StyleSheet, Text } from "react-native";

import type { ColorPalette } from "@/theme/types";

import type { ScopeItem } from "../scope-model";
import { ScopeRow } from "./scope-row";

type ScopeListProps = {
  colors: ColorPalette;
  emptyMessage: string;
  items: readonly ScopeItem[];
  loading: boolean;
  onPick: (item: ScopeItem) => void;
  selectedId: string | null;
};

/** The current level's entries, or why there are none yet. */
export function ScopeList({ colors, emptyMessage, items, loading, onPick, selectedId }: ScopeListProps) {
  if (loading && items.length === 0) {
    return <ActivityIndicator color={colors.accent} style={styles.loading} />;
  }
  if (items.length === 0) {
    return (
      <Text selectable style={[styles.empty, { color: colors.muted }]}>
        {emptyMessage}
      </Text>
    );
  }
  return (
    <>
      {items.map((item) => (
        <ScopeRow
          colors={colors}
          item={item}
          key={item.id}
          onPress={() => onPick(item)}
          selected={item.id === selectedId}
        />
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  loading: {
    paddingTop: 24,
  },
  empty: {
    fontSize: 15,
    lineHeight: 22,
    paddingHorizontal: 8,
    paddingTop: 8,
  },
});
