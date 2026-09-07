import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import type { ColorPalette } from "@/theme/types";

type FieldChoiceProps = {
  colors: ColorPalette;
  label: string;
  onChange: (value: string) => void;
  options: readonly string[];
  value: string;
};

/** Up to this many options are all shown as chips; beyond it a filter box narrows them. */
export const CHIP_LIMIT = 12;
const SUGGESTION_LIMIT = 8;

export function filterOptions(options: readonly string[], needle: string): readonly string[] {
  const query = needle.trim().toLowerCase();
  const matches = query ? options.filter((option) => option.toLowerCase().includes(query)) : options;
  return matches.slice(0, SUGGESTION_LIMIT);
}

/** One of a fixed set of values: chips, or a filter plus chips for long lists. */
export function FieldChoice({ colors, label, onChange, options, value }: FieldChoiceProps) {
  const [filter, setFilter] = useState("");
  const long = options.length > CHIP_LIMIT;
  const shown = long ? filterOptions(options, filter || value) : options;

  return (
    <View style={styles.root}>
      {long ? (
        <TextInput
          accessibilityLabel={`Filter ${label}`}
          autoCapitalize="none"
          autoCorrect={false}
          onChangeText={setFilter}
          placeholder={value ? value : `Filter ${options.length} options`}
          placeholderTextColor={colors.muted}
          style={[styles.filter, { backgroundColor: colors.cardBackground, color: colors.text }]}
          value={filter}
        />
      ) : null}
      <View style={styles.chips}>
        {shown.map((option) => {
          const selected = option === value;
          return (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected }}
              key={option}
              onPress={() => onChange(selected ? "" : option)}
              style={[
                styles.chip,
                { backgroundColor: selected ? colors.accent : colors.cardBackground },
              ]}
            >
              <Text style={[styles.chipLabel, { color: selected ? colors.accentText : colors.text }]}>
                {option}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: 8,
  },
  filter: {
    borderCurve: "continuous",
    borderRadius: 20,
    fontSize: 16,
    minHeight: 56,
    paddingHorizontal: 16,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    borderCurve: "continuous",
    borderRadius: 999,
    minHeight: 36,
    justifyContent: "center",
    paddingHorizontal: 14,
  },
  chipLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
});
