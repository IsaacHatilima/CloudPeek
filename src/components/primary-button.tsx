import { ActivityIndicator, StyleSheet, Text } from "react-native";
import { SymbolView } from "expo-symbols";

import { typography } from "@/theme/design";
import type { ColorPalette } from "@/theme/types";
import { Touchable } from "./touchable";

export function PrimaryButton({ busy = false, colors, disabled = false, label, onPress }: {
  busy?: boolean;
  colors: ColorPalette;
  disabled?: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <Touchable
      accessibilityRole="button"
      accessibilityState={{ busy, disabled: busy || disabled }}
      disabled={busy || disabled}
      onPress={onPress}
      style={[styles.button, { backgroundColor: colors.accent }]}
    >
      <Text style={[typography.label, { color: colors.accentText }]}>{label}</Text>
      {busy ? <ActivityIndicator color={colors.accentText} /> : (
        <SymbolView name={{ ios: "arrow.right", android: "arrow_forward", web: "arrow_forward" }} size={18} tintColor={colors.accentText} />
      )}
    </Touchable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center", borderCurve: "continuous", borderRadius: 20,
    flexDirection: "row", gap: 12, justifyContent: "center", minHeight: 56,
    paddingHorizontal: 24, paddingVertical: 16,
  },
});
