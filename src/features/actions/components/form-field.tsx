import { StyleSheet, Text, View } from "react-native";

import type { ColorPalette } from "@/theme/types";

import { fieldLabel, type FormField as FormFieldModel, type FormValue } from "../form-model";
import { FieldChoice } from "./field-choice";
import { FieldFile } from "./field-file";
import { FieldSwitch } from "./field-switch";
import { FieldText } from "./field-text";

type FormFieldProps = {
  colors: ColorPalette;
  error?: string;
  field: FormFieldModel;
  onChange: (value: FormValue) => void;
  value: FormValue | undefined;
};

function Control({ colors, field, onChange, value }: Omit<FormFieldProps, "error">) {
  const label = fieldLabel(field);
  switch (field.kind) {
    case "boolean":
      return <FieldSwitch colors={colors} label={label} onChange={onChange} value={typeof value === "boolean" ? value : null} />;
    case "file":
      return <FieldFile colors={colors} label={label} onChange={onChange} value={typeof value === "object" ? value : null} />;
    case "enum":
      return <FieldChoice colors={colors} label={label} onChange={onChange} options={field.options ?? []} value={typeof value === "string" ? value : ""} />;
    default:
      return <FieldText colors={colors} field={field} label={label} onChange={onChange} value={typeof value === "string" ? value : ""} />;
  }
}

/** Label, control, Cloud's own description as the hint, and the error once submitted. */
export function FormField({ colors, error, field, onChange, value }: FormFieldProps) {
  return (
    <View style={styles.root}>
      <Text style={[styles.label, { color: colors.text }]}>
        {fieldLabel(field)}
        {field.required ? <Text style={{ color: colors.primary }}> *</Text> : null}
      </Text>
      <Control colors={colors} field={field} onChange={onChange} value={value} />
      {field.description ? (
        <Text style={[styles.hint, { color: colors.muted }]}>{field.description}</Text>
      ) : null}
      {error ? <Text style={[styles.error, { color: colors.primary }]}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
  },
  hint: {
    fontSize: 13,
    lineHeight: 18,
  },
  error: {
    fontSize: 13,
    fontWeight: "600",
  },
});
