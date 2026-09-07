import { SymbolView } from "expo-symbols";
import { useState } from "react";
import { Alert, Linking, StyleSheet, Text, View } from "react-native";

import { Touchable } from "@/components/touchable";
import type { AttributeRow } from "@/features/resources/detail/attribute-presenter";
import type { ColorPalette } from "@/theme/types";

import { CardRow, DetailCard } from "./detail-card";

function AttributeValue({ colors, row }: { colors: ColorPalette; row: AttributeRow }) {
  const [expanded, setExpanded] = useState(false);
  const canExpand = !row.masked && (row.value.split("\n").length > 6 || row.value.length > 240);
  const content = (
    <>
      <Text style={[styles.label, { color: colors.muted }]}>{row.label}</Text>
      <View style={styles.valueLine}>
        <Text
          selectable={!row.href}
          numberOfLines={row.masked || (canExpand && !expanded) ? 6 : undefined}
          ellipsizeMode="tail"
          style={[styles.value, { color: row.href ? colors.link : colors.text }]}
        >
          {row.value}
        </Text>
        {row.href ? <SymbolView name={{ ios: "arrow.up.right", android: "open_in_new", web: "open_in_new" }} size={16} tintColor={colors.link} /> : null}
      </View>
      {row.detail ? <Text style={[styles.caption, { color: colors.muted }]}>{row.detail}</Text> : null}
    </>
  );
  return (
    <CardRow>
      {row.href ? (
        <Touchable
          accessibilityRole="link"
          accessibilityLabel={`Open repository ${row.value}`}
          accessibilityHint="Opens in your browser"
          style={styles.link}
          onPress={() => void Linking.openURL(row.href!).catch(() => Alert.alert("Unable to open repository", "Please try again."))}
        >
          {content}
        </Touchable>
      ) : content}
      {canExpand ? (
        <Touchable accessibilityRole="button" accessibilityState={{ expanded }} onPress={() => setExpanded(!expanded)} style={styles.expand}>
          <Text style={[styles.caption, { color: colors.link }]}>{expanded ? "Show less" : "Show more"}</Text>
        </Touchable>
      ) : null}
    </CardRow>
  );
}

function AttributeGroup({ colors, row, depth = 0 }: { colors: ColorPalette; row: AttributeRow; depth?: number }) {
  if (!row.children) return <AttributeValue colors={colors} row={row} />;
  return (
    <View style={[styles.group, depth > 0 && styles.nestedGroup]}>
      <Text accessibilityRole="header" style={[styles.groupTitle, { color: colors.text }]}>{row.label}</Text>
      {row.children.map((child) => <AttributeGroup colors={colors} row={child} depth={depth + 1} key={child.id} />)}
    </View>
  );
}

/** Structured settings get their own sections, with scalar metadata grouped together. */
export function AttributeRows({ colors, rows }: { colors: ColorPalette; rows: readonly AttributeRow[] }) {
  const details = rows.filter((row) => !row.children);
  const groups = rows.filter((row) => row.children);
  return (
    <>
      {details.length ? <DetailCard colors={colors} title="Details">
        {details.map((row) => <AttributeValue colors={colors} row={row} key={row.id} />)}
      </DetailCard> : null}
      {groups.map((row) => <DetailCard colors={colors} title={row.label} key={row.id}>
        {row.children?.map((child) => <AttributeGroup colors={colors} row={child} key={child.id} />)}
      </DetailCard>)}
    </>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 12, fontWeight: "600", letterSpacing: 0.3, marginBottom: 5, textTransform: "uppercase" },
  valueLine: { flexDirection: "row", alignItems: "center", gap: 12 },
  value: { flex: 1, fontSize: 16, fontVariant: ["tabular-nums"], lineHeight: 23 },
  caption: { fontSize: 13, lineHeight: 19, marginTop: 5 },
  link: { minHeight: 44, justifyContent: "center" },
  expand: { minHeight: 44, alignSelf: "flex-start", justifyContent: "center" },
  group: { paddingTop: 16, paddingBottom: 8 },
  nestedGroup: { marginLeft: 12 },
  groupTitle: { paddingHorizontal: 20, paddingBottom: 2, fontSize: 17, fontWeight: "600", lineHeight: 24 },
});
