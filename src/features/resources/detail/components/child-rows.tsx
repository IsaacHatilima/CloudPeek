import { Touchable } from "@/components/touchable";
import { SymbolView } from "expo-symbols";
import { StyleSheet, Text } from "react-native";

import type { ColorPalette } from "@/theme/types";

import type { ChildLink } from "../detail-model";
import { DetailCard } from "./detail-card";

type ChildRowsProps = {
  colors: ColorPalette;
  links: readonly ChildLink[];
  onPress: (link: ChildLink) => void;
};

/** Lists that live under this item (a cluster's databases…) and creates that have no list. */
export function ChildRows({ colors, links, onPress }: ChildRowsProps) {
  return (
    <DetailCard colors={colors} title="Related">
      {links.map((link) => (
        <Touchable
          accessibilityRole="button"
          key={link.item.id}
          onPress={() => onPress(link)}
          style={styles.row}
        >
          <SymbolView name={link.item.icon} size={18} tintColor={colors.accent} />
          <Text style={[styles.label, { color: colors.text }]}>
            {link.listable ? link.item.label : (link.create?.summary ?? link.item.label)}
          </Text>
          <SymbolView
            name={{ ios: "chevron.right", android: "chevron_right", web: "chevron_right" }}
            size={14}
            tintColor={colors.muted}
          />
        </Touchable>
      ))}
    </DetailCard>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    minHeight: 50,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  label: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
  },
});
