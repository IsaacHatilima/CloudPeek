import type { PropsWithChildren } from "react";
import { StyleSheet, Text, View } from "react-native";

import type { ColorPalette } from "@/theme/types";

/** A titled, grouped card; rows are separated by generous vertical padding. */
export function DetailCard({
  children,
  colors,
  title,
}: PropsWithChildren<{ colors: ColorPalette; title: string }>) {
  return (
    <View style={styles.root}>
      <Text style={[styles.title, { color: colors.muted }]}>{title}</Text>
      <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>{children}</View>
    </View>
  );
}

export function CardRow({ children }: PropsWithChildren) {
  return <View style={styles.row}>{children}</View>;
}

const styles = StyleSheet.create({
  root: {
    gap: 8,
  },
  title: {
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.4,
    paddingHorizontal: 4,
    textTransform: "uppercase",
  },
  card: {
    borderCurve: "continuous",
    borderRadius: 24,
    overflow: "hidden",
  },
  row: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
});
