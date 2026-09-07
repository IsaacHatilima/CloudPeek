import { SymbolView } from "expo-symbols";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { ScopeLevel } from "@/features/workspace/types";
import type { ColorPalette } from "@/theme/types";

import type { ScopeCrumb } from "../scope-model";

/** The sheet's path: chosen levels are tappable and go back up; the last is the level showing. */
export function ScopeCrumbs({
  colors,
  crumbs,
  onSelect,
}: {
  colors: ColorPalette;
  crumbs: readonly ScopeCrumb[];
  onSelect: (level: ScopeLevel) => void;
}) {
  return (
    <View style={styles.row}>
      {crumbs.map((crumb, index) => (
        <View key={crumb.level} style={styles.crumb}>
          {index > 0 ? (
            <SymbolView
              name={{ ios: "chevron.right", android: "chevron_right", web: "chevron_right" }}
              size={11}
              tintColor={colors.muted}
            />
          ) : null}
          {crumb.current ? (
            <Text style={[styles.current, { color: colors.text }]}>{crumb.label}</Text>
          ) : (
            <Pressable
              accessibilityRole="button"
              hitSlop={6}
              onPress={() => onSelect(crumb.level)}
              style={({ pressed }) => pressed && styles.pressed}
            >
              <Text numberOfLines={1} style={[styles.parent, { color: colors.link }]}>
                {crumb.label}
              </Text>
            </Pressable>
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    paddingBottom: 12,
    paddingHorizontal: 8,
  },
  crumb: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
  },
  parent: {
    fontSize: 15,
    fontWeight: "500",
  },
  current: {
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  pressed: {
    opacity: 0.55,
  },
});
