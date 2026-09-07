/**
 * The side menu's Organization item: the organizations connected to this
 * device (one API token each), the active one marked, and a floating button
 * to connect another. Reuses the scope sheet's organization level as its data.
 */
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { FAB_SIZE, FloatingActionButton } from "@/components/floating-action-button";
import { ScopeList } from "@/features/scope/components/scope-list";
import { scopeLevelModel } from "@/features/scope/scope-model";
import { useShellNavigation } from "@/features/shell/hooks/use-shell-navigation";
import { useConnectedOrganizations, useWorkspaceSelection } from "@/features/workspace/use-workspace";
import { useWorkspaceStore } from "@/features/workspace/workspace-store";
import { useAppTheme } from "@/theme/use-app-theme";

export function OrganizationsScreen() {
  const { colors } = useAppTheme();
  const organizations = useConnectedOrganizations();
  const selection = useWorkspaceSelection();
  const selectOrganization = useWorkspaceStore((state) => state.selectOrganization);
  const { openConnect } = useShellNavigation();
  const model = scopeLevelModel("organization", {
    applications: [],
    environments: [],
    organizations,
    selection,
  });

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.content} contentInsetAdjustmentBehavior="automatic">
        <ScopeList
          colors={colors}
          emptyMessage={model.emptyMessage}
          items={model.items}
          loading={false}
          onPick={selectOrganization}
          selectedId={model.selectedId}
        />
        <Text selectable style={[styles.hint, { color: colors.muted }]}>
          Each organization is one Laravel Cloud API token, kept in the device keychain. Tap one to
          switch to it.
        </Text>
      </ScrollView>
      <FloatingActionButton
        accessibilityLabel={model.connectLabel ?? "Connect an organization"}
        colors={colors}
        icon={{ ios: "plus", android: "add", web: "add" }}
        onPress={openConnect}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    paddingBottom: FAB_SIZE * 2,
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  hint: {
    fontSize: 13,
    lineHeight: 18,
    paddingHorizontal: 12,
    paddingTop: 14,
    textAlign: "center",
  },
});
