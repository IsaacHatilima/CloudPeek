import { StyleSheet, Text, View } from "react-native";

import { typography } from "@/theme/design";
import { STATUS_PALETTES, type Tone } from "@/theme/tones";
import { useAppTheme } from "@/theme/use-app-theme";

export function StatusBadge({ status, tone }: { status: string; tone: Tone }) {
  const { colorScheme } = useAppTheme();
  const color = STATUS_PALETTES[colorScheme][tone];
  return (
    <View style={[styles.badge, { backgroundColor: color.background }]}>
      <View style={[styles.dot, { backgroundColor: color.text }]} />
      <Text style={[typography.caption, styles.label, { color: color.text }]}>{status.replaceAll("_", " ")}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { alignItems: "center", alignSelf: "flex-start", borderRadius: 12, flexDirection: "row", gap: 8, paddingHorizontal: 12, paddingVertical: 4, maxWidth: "100%" },
  dot: { borderRadius: 3, height: 6, width: 6 },
  label: { flexShrink: 1, fontWeight: "600" },
});
