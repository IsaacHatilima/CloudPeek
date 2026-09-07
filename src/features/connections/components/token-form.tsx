import { StyleSheet, Text, TextInput, View } from "react-native";
import { useState } from "react";

import { PrimaryButton } from "@/components/primary-button";
import { typography } from "@/theme/design";
import { TONE_COLORS } from "@/theme/tones";
import type { ColorPalette } from "@/theme/types";

type TokenFormProps = { busy: boolean; colors: ColorPalette; error: string | null; onChange: (token: string) => void; onSubmit: () => void; token: string };
export function TokenForm({ busy, colors, error, onChange, onSubmit, token }: TokenFormProps) {
  const [focused, setFocused] = useState(false);
  const disabled = token.trim() === "";
  return (
    <View style={styles.form}>
      <Text style={[typography.label, { color: colors.text }]}>API token</Text>
      <TextInput accessibilityLabel="API token" autoCapitalize="none" autoCorrect={false} editable={!busy}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} onChangeText={onChange}
        onSubmitEditing={disabled || busy ? undefined : onSubmit} placeholder="Paste your token" placeholderTextColor={colors.muted}
        secureTextEntry returnKeyType="go" style={[typography.body, styles.input, { backgroundColor: focused ? colors.accentSoft : colors.cardBackground, color: colors.text }]} value={token} />
      {error ? <Text accessibilityLiveRegion="polite" selectable style={[typography.caption, { color: TONE_COLORS.negative }]}>{error}</Text> : null}
      <View style={styles.submit}><PrimaryButton busy={busy} colors={colors} disabled={disabled} label={busy ? "Connecting…" : "Connect organization"} onPress={onSubmit} /></View>
    </View>
  );
}
const styles = StyleSheet.create({
  form: { gap: 12 },
  input: { borderCurve: "continuous", borderRadius: 20, minHeight: 60, paddingHorizontal: 20, paddingVertical: 16 },
  submit: { marginTop: 8 },
});
