import { StyleSheet, Switch, Text, View } from "react-native";

import type { ColorPalette } from "@/theme/types";

type FieldSwitchProps = {
  colors: ColorPalette;
  label: string;
  onChange: (value: boolean) => void;
  /** `null` until touched: an optional flag that is not sent. */
  value: boolean | null;
};

export function FieldSwitch({ colors, label, onChange, value }: FieldSwitchProps) {
  return (
    <View style={[styles.row, { backgroundColor: colors.cardBackground }]}>
      <Text style={[styles.state, { color: colors.muted }]}>
        {value === null ? "Not set" : value ? "On" : "Off"}
      </Text>
      <Switch
        accessibilityLabel={label}
        onValueChange={onChange}
        trackColor={{ true: colors.accent }}
        value={value ?? false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 56,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  state: {
    fontSize: 15,
  },
});
