import { SymbolView, type SymbolViewProps } from "expo-symbols";
import { StyleSheet, Text, View } from "react-native";

import { Avatar } from "@/components/avatar";
import { StatusBadge } from "@/components/status-badge";
import { Touchable } from "@/components/touchable";
import { typography } from "@/theme/design";
import type { ColorPalette } from "@/theme/types";

import type { RowModel } from "../presenters";

type ResourceRowProps = {
  colors: ColorPalette;
  icon?: SymbolViewProps["name"];
  onPress?: () => void;
  row: RowModel;
};

export function ResourceRow({ colors, icon, onPress, row }: ResourceRowProps) {
  const opens = onPress !== undefined && row.openable;
  const content = (
    <>
      <View style={styles.heading}>
        {row.avatar ? <Avatar colors={colors} name={row.avatar.name} uri={row.avatar.uri} size={44} /> : (
          <View style={[styles.icon, { backgroundColor: colors.accentSoft }]}>
            <SymbolView name={icon ?? { ios: "square.stack.3d.up", android: "layers", web: "layers" }} size={22} tintColor={colors.link} />
          </View>
        )}
        <View style={styles.text}>
          <Text numberOfLines={2} style={[typography.label, { color: colors.text }]}>{row.title}</Text>
          {row.subtitle ? <Text numberOfLines={2} style={[typography.caption, { color: colors.muted }]}>{row.subtitle}</Text> : null}
        </View>
        {opens ? <SymbolView name={{ ios: "chevron.right", android: "chevron_right", web: "chevron_right" }} size={13} tintColor={colors.muted} /> : null}
      </View>
      {row.status ? <View style={styles.footer}><StatusBadge status={row.status} tone={row.tone} /></View> : null}
    </>
  );

  const style = [styles.card, { backgroundColor: colors.cardBackground }];
  return opens ? (
    <Touchable accessibilityRole="button" onPress={onPress} style={style}>{content}</Touchable>
  ) : <View style={style}>{content}</View>;
}

const styles = StyleSheet.create({
  card: { borderCurve: "continuous", borderRadius: 24, gap: 16, padding: 20 },
  heading: { alignItems: "center", flexDirection: "row", gap: 12 },
  icon: { alignItems: "center", borderCurve: "continuous", borderRadius: 16, height: 44, justifyContent: "center", width: 44 },
  text: { flex: 1, gap: 4 },
  footer: { paddingLeft: 56 },
});
