import { SymbolView } from "expo-symbols";
import { StyleSheet, TextInput, View } from "react-native";

import { typography } from "@/theme/design";
import type { ColorPalette } from "@/theme/types";
import { Touchable } from "./touchable";

export function SearchField({ colors, label, onChange, value }: {
  colors: ColorPalette; label: string; onChange: (value: string) => void; value: string;
}) {
  return (
    <View style={[styles.root, { backgroundColor: colors.cardBackground }]}>
      <SymbolView name={{ ios: "magnifyingglass", android: "search", web: "search" }} size={18} tintColor={colors.muted} />
      <TextInput accessibilityLabel={label} autoCapitalize="none" autoCorrect={false} returnKeyType="search"
        onChangeText={onChange} placeholder={label} placeholderTextColor={colors.muted}
        style={[typography.body, styles.input, { color: colors.text }]} value={value} />
      {value ? <Touchable accessibilityLabel="Clear search" accessibilityRole="button" onPress={() => onChange("")} style={styles.clear}>
        <SymbolView name={{ ios: "xmark.circle.fill", android: "cancel", web: "cancel" }} size={18} tintColor={colors.muted} />
      </Touchable> : null}
    </View>
  );
}
const styles = StyleSheet.create({
  root: { alignItems: "center", borderCurve: "continuous", borderRadius: 16, flexDirection: "row", gap: 12, minHeight: 52, paddingLeft: 16, paddingRight: 8 },
  input: { flex: 1, minWidth: 0, paddingVertical: 12 },
  clear: { alignItems: "center", justifyContent: "center", height: 44, width: 44 },
});
