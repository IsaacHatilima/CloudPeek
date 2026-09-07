import { useState } from "react";
import { SymbolView } from "expo-symbols";
import { Linking, ScrollView, StyleSheet, Text, View } from "react-native";

import { Touchable } from "@/components/touchable";
import { typography } from "@/theme/design";
import { useAppTheme } from "@/theme/use-app-theme";
import { TokenForm } from "./components/token-form";
import { useConnectOrganization } from "./use-connect-organization";

const TOKEN_DOCS_URL = "https://laravel.com/cloud/docs/api/authentication";

export function ConnectOrganizationScreen() {
  const { colors } = useAppTheme();
  const [token, setToken] = useState("");
  const connect = useConnectOrganization();
  return (
    <ScrollView automaticallyAdjustKeyboardInsets contentInsetAdjustmentBehavior="automatic" keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content} style={{ flex: 1, backgroundColor: colors.surfaceBackground }}>
        <View style={[styles.icon, { backgroundColor: colors.accentSoft }]}>
          <SymbolView name={{ ios: "key.horizontal", android: "key", web: "key" }} size={28} tintColor={colors.link} />
        </View>
        <View style={styles.intro}>
          <Text style={[typography.eyebrow, { color: colors.link }]}>A SECURE CONNECTION</Text>
          <Text selectable style={[typography.display, { color: colors.text }]}>Bring your cloud{"\n"}into view.</Text>
          <Text selectable style={[typography.body, { color: colors.muted }]}>Paste an API token from your organization’s settings in Laravel Cloud.</Text>
        </View>
        <TokenForm busy={connect.isPending} colors={colors} error={connect.error?.message ?? null} onChange={setToken} onSubmit={() => connect.mutate(token)} token={token} />
        <View style={styles.security}>
          <SymbolView name={{ ios: "lock.fill", android: "lock", web: "lock" }} size={14} tintColor={colors.muted} />
          <Text style={[typography.caption, styles.securityText, { color: colors.muted }]}>Stored securely on this device. Your token’s permissions determine what you can do.</Text>
        </View>
        <Touchable accessibilityRole="link" onPress={() => void Linking.openURL(TOKEN_DOCS_URL)} style={styles.help}>
          <Text style={[typography.label, { color: colors.link }]}>How to create a token</Text>
          <SymbolView name={{ ios: "arrow.up.right", android: "north_east", web: "north_east" }} size={14} tintColor={colors.link} />
        </Touchable>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  content: { gap: 24, padding: 24, paddingTop: 32, paddingBottom: 48 },
  icon: { alignItems: "center", borderRadius: 20, height: 64, justifyContent: "center", width: 64 },
  intro: { gap: 12 },
  security: { alignItems: "flex-start", flexDirection: "row", gap: 8 },
  securityText: { flex: 1 },
  help: { alignItems: "center", flexDirection: "row", justifyContent: "center", minHeight: 44, gap: 8 },
});
