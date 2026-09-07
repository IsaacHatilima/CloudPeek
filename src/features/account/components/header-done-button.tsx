import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text } from "react-native";

import { useAppTheme } from "@/theme/use-app-theme";

/** Dismisses the account modal; swiping it down works too. */
export function HeaderDoneButton() {
  const router = useRouter();
  const { colors } = useAppTheme();

  return (
    <Pressable
      accessibilityRole="button"
      hitSlop={8}
      onPress={() => router.back()}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <Text style={[styles.label, { color: colors.link }]}>Done</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 4,
    paddingVertical: 6,
  },
  label: {
    fontSize: 17,
    fontWeight: "600",
  },
  pressed: {
    opacity: 0.55,
  },
});
