import { SymbolView } from "expo-symbols";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PrimaryButton } from "@/components/primary-button";
import { typography } from "@/theme/design";
import type { ColorPalette } from "@/theme/types";

export function WelcomePanel({ colors, onConnect }: { colors: ColorPalette; onConnect: () => void }) {
  const insets = useSafeAreaInsets();
  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}>
      <View style={[styles.hero, { backgroundColor: colors.cardBackground }]}>
        <View style={styles.art} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          <View style={[styles.orbit, { backgroundColor: colors.accentSoft }]} />
          <View style={[styles.cloud, { backgroundColor: colors.accent }]}>
            <SymbolView name={{ ios: "cloud.fill", android: "cloud", web: "cloud" }} size={44} tintColor={colors.accentText} />
          </View>
          <View style={[styles.satellite, { backgroundColor: colors.subtle }]}>
            <SymbolView name={{ ios: "server.rack", android: "dns", web: "dns" }} size={20} tintColor={colors.text} />
          </View>
        </View>
        <Text style={[typography.eyebrow, { color: colors.link }]}>LARAVEL CLOUD, ON HAND</Text>
        <Text style={[typography.display, { color: colors.text }]}>Keep your{"\n"}cloud close.</Text>
        <Text style={[typography.body, { color: colors.muted }]}>Check status, review deployments, and manage your infrastructure wherever you are.</Text>
      </View>
      <View style={styles.detail}>
        <SymbolView name={{ ios: "lock.shield", android: "verified_user", web: "verified_user" }} size={22} tintColor={colors.link} />
        <View style={styles.detailText}>
          <Text style={[typography.label, { color: colors.text }]}>Connected securely</Text>
          <Text style={[typography.caption, { color: colors.muted }]}>Add an organization with its API token. Credentials stay in your device’s secure storage.</Text>
        </View>
      </View>
      <PrimaryButton colors={colors} label="Connect an organization" onPress={onConnect} />
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  content: { flexGrow: 1, gap: 24, paddingHorizontal: 24, paddingTop: 8 },
  hero: { borderCurve: "continuous", borderRadius: 32, gap: 16, padding: 24 },
  art: { height: 120, justifyContent: "center", marginBottom: 8 },
  orbit: { borderRadius: 56, height: 112, position: "absolute", width: 112, left: 16 },
  cloud: { alignItems: "center", borderCurve: "continuous", borderRadius: 28, height: 88, justifyContent: "center", width: 88, transform: [{ rotate: "-8deg" }] },
  satellite: { alignItems: "center", borderRadius: 16, bottom: 0, height: 44, justifyContent: "center", left: 100, position: "absolute", width: 44, transform: [{ rotate: "8deg" }] },
  detail: { alignItems: "flex-start", flexDirection: "row", gap: 16, paddingHorizontal: 8 },
  detailText: { flex: 1, gap: 4 },
});
