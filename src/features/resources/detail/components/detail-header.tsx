import { SymbolView, type SymbolViewProps } from "expo-symbols";
import { StyleSheet, Text, View } from "react-native";

import { Avatar } from "@/components/avatar";
import { StatusBadge } from "@/components/status-badge";
import { typography } from "@/theme/design";
import type { ColorPalette } from "@/theme/types";
import type { RowModel } from "../../presenters";

export function DetailHeader({ colors, icon, row }: { colors: ColorPalette; icon: SymbolViewProps["name"]; row: RowModel }) {
  return (
    <View style={[styles.root, { backgroundColor: colors.cardBackground }]}>
      <View style={styles.top}>
        {row.avatar ? <Avatar colors={colors} name={row.avatar.name} size={56} uri={row.avatar.uri} /> : (
          <View style={[styles.icon, { backgroundColor: colors.accentSoft }]}>
            <SymbolView name={icon} size={28} tintColor={colors.link} />
          </View>
        )}
        {row.status ? <View style={styles.status}><StatusBadge status={row.status} tone={row.tone} /></View> : null}
      </View>
      <Text selectable style={[typography.title, { color: colors.text }]}>{row.title}</Text>
      {row.subtitle ? <Text selectable style={[typography.body, { color: colors.muted }]}>{row.subtitle}</Text> : null}
    </View>
  );
}
const styles = StyleSheet.create({
  root: { borderCurve: "continuous", borderRadius: 28, gap: 12, padding: 24 },
  top: { alignItems: "center", flexDirection: "row", gap: 16, justifyContent: "space-between", marginBottom: 8 },
  icon: { alignItems: "center", borderRadius: 20, height: 56, justifyContent: "center", width: 56 },
  status: { flexShrink: 1 },
});
