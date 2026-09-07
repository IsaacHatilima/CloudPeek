import { StyleSheet, TextInput } from "react-native";

import type { FieldSchema } from "@/services/cloud-api/operation-types";
import type { ColorPalette } from "@/theme/types";

type FieldTextProps = {
  colors: ColorPalette;
  field: FieldSchema;
  label: string;
  onChange: (value: string) => void;
  value: string;
};

const TALL_KINDS: ReadonlySet<FieldSchema["kind"]> = new Set(["json", "string-list"]);

function placeholderFor(field: FieldSchema): string {
  if (field.example) return field.example;
  if (field.kind === "string-list") return "One per line";
  if (field.kind === "json") return "{ }";
  return field.format === "date-time" ? "2026-01-01T00:00:00Z" : "";
}

/** Free text, numbers, JSON, and lists; numbers get the numeric keyboard. */
export function FieldText({ colors, field, label, onChange, value }: FieldTextProps) {
  const numeric = field.kind === "integer" || field.kind === "number";
  const tall = TALL_KINDS.has(field.kind);

  return (
    <TextInput
      accessibilityLabel={label}
      autoCapitalize="none"
      autoCorrect={false}
      keyboardType={numeric ? "numbers-and-punctuation" : "default"}
      multiline={tall}
      onChangeText={onChange}
      placeholder={placeholderFor(field)}
      placeholderTextColor={colors.muted}
      style={[
        styles.input,
        tall && styles.tall,
        { backgroundColor: colors.cardBackground, color: colors.text },
      ]}
      value={value}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    borderCurve: "continuous",
    borderRadius: 20,
    fontSize: 16,
    minHeight: 56,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  tall: {
    fontFamily: "Menlo",
    fontSize: 14,
    minHeight: 96,
    textAlignVertical: "top",
  },
});
