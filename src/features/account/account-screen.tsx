import Constants from "expo-constants";
import { SymbolView } from "expo-symbols";
import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { PrimaryButton } from "@/components/primary-button";
import { useConnectedOrganizations } from "@/features/workspace/use-workspace";
import { typography } from "@/theme/design";
import { useAppTheme } from "@/theme/use-app-theme";
import { accountSections } from "./account-sections";
import { AccountSectionCard } from "./components/account-section-card";

export function AccountScreen() {
  const { colors } = useAppTheme();
  const organizations = useConnectedOrganizations();
  const version = Constants.expoConfig?.version ?? "development";
  const router = useRouter();
  return (
    <ScrollView contentContainerStyle={styles.content} contentInsetAdjustmentBehavior="automatic" style={{ backgroundColor: colors.surfaceBackground }}>
      <View style={[styles.identity, { backgroundColor: colors.cardBackground }]}>
        <View style={[styles.icon, { backgroundColor: colors.accentSoft }]}>
          <SymbolView name={{ ios: "lock.shield", android: "verified_user", web: "verified_user" }} size={28} tintColor={colors.link} />
        </View>
        <Text style={[typography.eyebrow, { color: colors.muted }]}>YOUR WORKSPACE</Text>
        <Text selectable style={[typography.display, { color: colors.text }]}>{organizations.length === 0 ? "Make yourself\nat home." : "Your cloud,\nconnected."}</Text>
        <Text style={[typography.body, { color: colors.muted }]}>{organizations.length === 0 ? "Connect your first organization to get started." : `${organizations.length} organization${organizations.length === 1 ? "" : "s"} connected on this device.`}</Text>
      </View>
      <PrimaryButton colors={colors} label="Connect an organization" onPress={() => router.push("/connect")} />
      {accountSections({ organizations, version }).map((section) => <AccountSectionCard colors={colors} key={section.id} section={section} />)}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  content: { gap: 24, paddingBottom: 48, paddingHorizontal: 24, paddingTop: 16 },
  identity: { alignItems: "flex-start", borderCurve: "continuous", borderRadius: 28, gap: 12, padding: 24 },
  icon: { alignItems: "center", borderRadius: 20, height: 56, justifyContent: "center", marginBottom: 8, width: 56 },
});
