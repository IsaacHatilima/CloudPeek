import { Image, Pressable, StyleSheet, Text } from "react-native";

import type { ColorPalette } from "@/theme/types";

import mark from "../../../../assets/brand/mark.png";

/** The app mark and wordmark at the top of the menu; tapping returns to the overview. */
export function SideMenuBrand({
  colors,
  onPress,
}: {
  colors: ColorPalette;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityLabel="Cloud Peek overview"
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <Image accessibilityIgnoresInvertColors source={mark} style={styles.mark} />
      <Text style={[styles.name, { color: colors.text }]}>
        Cloud{" "}
        <Text style={{ color: colors.primary }}>Peek</Text>
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    paddingBottom: 12,
    paddingHorizontal: 8,
  },
  mark: {
    borderCurve: "continuous",
    borderRadius: 8,
    height: 30,
    width: 30,
  },
  name: {
    fontSize: 24,
    fontWeight: "700",
    letterSpacing: -0.8,
  },
  pressed: {
    opacity: 0.55,
  },
});
