import { SymbolView, type SymbolViewProps } from "expo-symbols";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { PrimaryButton } from "@/components/primary-button";
import { typography } from "@/theme/design";
import type { ColorPalette } from "@/theme/types";

export type StateMessageAction = { label: string; onPress: () => void };
type StateMessageProps = { action?: StateMessageAction; body?: string; colors: ColorPalette; icon?: SymbolViewProps["name"]; title: string };

export function StateMessage({ action, body, colors, icon, title }: StateMessageProps) {
  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.scroll}>
      <View style={styles.root}>
        <View style={[styles.iconWell, { backgroundColor: colors.accentSoft }]}>
          <SymbolView name={icon ?? { ios: "tray", android: "inbox", web: "inbox" }} size={32} tintColor={colors.link} />
        </View>
        <Text selectable style={[typography.title, styles.center, { color: colors.text }]}>{title}</Text>
        {body ? <Text selectable style={[typography.body, styles.center, { color: colors.muted }]}>{body}</Text> : null}
        {action ? <View style={styles.action}><PrimaryButton colors={colors} label={action.label} onPress={action.onPress} /></View> : null}
      </View>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  scroll: { flexGrow: 1, justifyContent: "center", paddingVertical: 32 },
  root: { alignItems: "center", alignSelf: "center", gap: 16, maxWidth: 400, paddingHorizontal: 24, width: "100%" },
  iconWell: { alignItems: "center", borderCurve: "continuous", borderRadius: 28, height: 80, justifyContent: "center", marginBottom: 8, width: 80 },
  center: { textAlign: "center" },
  action: { alignSelf: "stretch", marginTop: 16 },
});
