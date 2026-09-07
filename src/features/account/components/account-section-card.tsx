import { Touchable } from "@/components/touchable";
import { SymbolView } from "expo-symbols";
import { Linking, StyleSheet, Text, View } from "react-native";

import type { ColorPalette } from "@/theme/types";

import type { AccountItem, AccountSection } from "../account-sections";

export function AccountSectionCard({
  colors,
  section,
}: {
  colors: ColorPalette;
  section: AccountSection;
}) {
  return (
    <View style={styles.section}>
      <Text style={[styles.title, { color: colors.muted }]}>{section.title}</Text>
      <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
        {section.items.map((item) => (
          <AccountRow colors={colors} item={item} key={item.id} />
        ))}
      </View>
    </View>
  );
}

function AccountRow({
  colors,
  item,
}: {
  colors: ColorPalette;
  item: AccountItem;
}) {
  const { href } = item;

  return (
    <Touchable
      accessibilityRole={href ? "link" : "text"}
      onPress={href ? () => void Linking.openURL(href) : undefined}
      style={styles.row}
    >
      <View style={styles.text}>
        <Text style={[styles.label, { color: colors.text }]}>{item.label}</Text>
        {item.detail ? (
          <Text style={[styles.detail, { color: href ? colors.link : colors.muted }]}>
            {item.detail}
          </Text>
        ) : null}
      </View>
      {href ? (
        <SymbolView
          name={{ ios: "arrow.up.right", android: "arrow_outward", web: "arrow_outward" }}
          size={14}
          tintColor={colors.muted}
        />
      ) : null}
    </Touchable>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 6,
  },
  title: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.4,
    paddingHorizontal: 8,
    textTransform: "uppercase",
  },
  card: {
    borderCurve: "continuous",
    borderRadius: 24,
    overflow: "hidden",
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  text: {
    flex: 1,
    gap: 3,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
  },
  detail: {
    fontSize: 13,
    lineHeight: 18,
  },
});
