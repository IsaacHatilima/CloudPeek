import { SymbolView, type SymbolViewProps } from "expo-symbols";
import { StyleSheet, Text, View } from "react-native";

import { Touchable } from "@/components/touchable";
import { typography } from "@/theme/design";
import type { ColorPalette } from "@/theme/types";

type SideMenuItemProps = { caption?: string; colors: ColorPalette; dimmed: boolean; icon: SymbolViewProps["name"]; label: string; onPress: () => void; selected: boolean };
export function SideMenuItem({ caption, colors, dimmed, icon, label, onPress, selected }: SideMenuItemProps) {
  return (
    <Touchable accessibilityHint={caption} accessibilityRole="button" accessibilityState={{ selected }} onPress={onPress}
      style={[styles.row, selected && { backgroundColor: colors.menuSelected }]}>
      <View style={[styles.icon, { backgroundColor: selected ? colors.accentSoft : "transparent" }]}>
        <SymbolView name={icon} size={20} tintColor={selected ? colors.link : colors.muted} />
      </View>
      <View style={styles.labels}>
        <Text numberOfLines={1} style={[typography.body, selected && styles.selected, { color: dimmed ? colors.muted : colors.text }]}>{label}</Text>
        {caption ? <Text numberOfLines={2} style={[typography.caption, { color: colors.muted }]}>{caption}</Text> : null}
      </View>
      {selected ? <View style={[styles.dot, { backgroundColor: colors.link }]} /> : null}
    </Touchable>
  );
}
const styles = StyleSheet.create({
  row: { alignItems: "center", borderCurve: "continuous", borderRadius: 20, flexDirection: "row", gap: 8, minHeight: 52, paddingHorizontal: 8, paddingVertical: 8 },
  icon: { alignItems: "center", borderRadius: 12, height: 36, justifyContent: "center", width: 36 },
  labels: { flex: 1, gap: 4 },
  selected: { fontWeight: "600" },
  dot: { borderRadius: 3, height: 6, marginRight: 8, width: 6 },
});
