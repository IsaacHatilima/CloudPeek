import { StyleSheet, Text, View } from "react-native";

import { PrimaryButton } from "@/components/primary-button";
import { typography } from "@/theme/design";
import { TONE_COLORS } from "@/theme/tones";
import type { ColorPalette } from "@/theme/types";

type FormSubmitProps = { colors: ColorPalette; destructive: boolean; failure: string | null; label: string; onPress: () => void; pending: boolean };

export function FormSubmit({ colors, destructive, failure, label, onPress, pending }: FormSubmitProps) {
  return (
    <View style={styles.root}>
      {failure ? <Text accessibilityLiveRegion="polite" selectable style={[typography.caption, { color: TONE_COLORS.negative }]}>{failure}</Text> : null}
      <PrimaryButton busy={pending} colors={destructive ? { ...colors, accent: TONE_COLORS.negative } : colors} label={label} onPress={onPress} />
    </View>
  );
}
const styles = StyleSheet.create({ root: { gap: 12, paddingTop: 8 } });
