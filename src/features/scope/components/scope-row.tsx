import { SymbolView } from "expo-symbols";
import { StyleSheet, Text, View } from "react-native";

import { Touchable } from "@/components/touchable";

import { Avatar } from "@/components/avatar";
import { displayStatus, toneFor } from "@/features/resources/presenters";
import { TONE_COLORS } from "@/theme/tones";
import type { ColorPalette } from "@/theme/types";

import type { ScopeItem } from "../scope-model";

export function ScopeRow({
  colors,
  item,
  onPress,
  selected,
}: {
  colors: ColorPalette;
  item: ScopeItem;
  onPress: () => void;
  selected: boolean;
}) {
  const status = displayStatus(item.status);
  const detail = [item.slug, status].filter(Boolean).join(" · ");

  return (
    <Touchable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.row, { backgroundColor: selected ? colors.accentSoft : colors.cardBackground }]}
    >
      {item.avatar ? (
        <Avatar colors={colors} name={item.avatar.name} size={36} uri={item.avatar.uri} />
      ) : item.status ? (
        <View style={[styles.dot, { backgroundColor: TONE_COLORS[toneFor(item.status)] }]} />
      ) : null}
      <View style={styles.text}>
        <Text numberOfLines={1} style={[styles.name, { color: colors.text }]}>
          {item.name}
        </Text>
        {detail ? (
          <Text numberOfLines={1} style={[styles.detail, { color: colors.muted }]}>
            {detail}
          </Text>
        ) : null}
      </View>
      {selected ? (
        <SymbolView
          name={{ ios: "checkmark", android: "check", web: "check" }}
          size={16}
          tintColor={colors.accent}
        />
      ) : null}
    </Touchable>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 20,
    flexDirection: "row",
    gap: 12,
    minHeight: 72,
    marginBottom: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  dot: {
    borderRadius: 4,
    height: 8,
    width: 8,
  },
  text: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
  },
  detail: {
    fontSize: 13,
  },
});
