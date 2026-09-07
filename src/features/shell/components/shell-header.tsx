import { SymbolView } from "expo-symbols";
import type { PropsWithChildren } from "react";
import { StyleSheet, Text, View } from "react-native";

import { Touchable } from "@/components/touchable";
import { typography } from "@/theme/design";
import type { ColorPalette } from "@/theme/types";

type ShellHeaderProps = PropsWithChildren<{
  colors: ColorPalette;
  onBack?: () => void;
  onOpenAccount: () => void;
  onOpenMenu: () => void;
  safeAreaTop: number;
  title: string;
}>;

export function ShellHeader({ children, colors, onBack, onOpenAccount, onOpenMenu, safeAreaTop, title }: ShellHeaderProps) {
  return (
    <View style={[styles.header, { paddingTop: Math.max(safeAreaTop, 12) }]}>
      <View style={styles.toolbar}>
        <Touchable
          accessibilityLabel={onBack ? "Back" : "Open menu"}
          accessibilityRole="button"
          onPress={onBack ?? onOpenMenu}
          style={[styles.iconButton, { backgroundColor: colors.cardBackground }]}
        >
          <SymbolView name={onBack
            ? { ios: "chevron.left", android: "arrow_back", web: "arrow_back" }
            : { ios: "line.3.horizontal", android: "menu", web: "menu" }} size={20} tintColor={colors.text} />
        </Touchable>
        <View style={styles.wordmark}>
          <View style={[styles.brandDot, { backgroundColor: colors.primary }]} />
          <Text style={[typography.eyebrow, { color: colors.muted }]}>CLOUD PEEK</Text>
        </View>
        <Touchable accessibilityLabel="Account" accessibilityRole="button" onPress={onOpenAccount}
          style={[styles.iconButton, { backgroundColor: colors.cardBackground }]}>
          <SymbolView name={{ ios: "person.crop.circle", android: "account_circle", web: "account_circle" }} size={24} tintColor={colors.text} />
        </Touchable>
      </View>
      <Text accessibilityRole="header" numberOfLines={2} style={[onBack ? typography.title : typography.display, styles.title, { color: colors.text }]}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { gap: 16, paddingBottom: 16 },
  toolbar: { alignItems: "center", flexDirection: "row", paddingHorizontal: 24, paddingTop: 8 },
  iconButton: { alignItems: "center", borderRadius: 16, height: 44, justifyContent: "center", width: 44 },
  wordmark: { alignItems: "center", flex: 1, flexDirection: "row", gap: 8, justifyContent: "center" },
  brandDot: { borderRadius: 3, height: 6, width: 6 },
  title: { paddingHorizontal: 24 },
});
