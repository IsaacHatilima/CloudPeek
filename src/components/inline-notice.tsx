import { StyleSheet, Text } from "react-native";

import { typography } from "@/theme/design";
import type { ColorPalette } from "@/theme/types";

import { Touchable } from "./touchable";

export function InlineNotice({ colors, message, onPress }: { colors: ColorPalette; message: string; onPress: () => void }) {
  return <Touchable accessibilityRole="button" onPress={onPress} style={[styles.notice, { backgroundColor: colors.accentSoft }]}>
    <Text style={[typography.caption, { color: colors.link }]}>{message}</Text>
  </Touchable>;
}

const styles = StyleSheet.create({ notice: { borderRadius: 16, padding: 16, minHeight: 48, justifyContent: "center" } });
