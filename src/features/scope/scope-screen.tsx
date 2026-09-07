/**
 * `/scope?level=…`: one drill-down sheet for organization, application, and
 * environment. Opens at the level tapped in the header (pulled up to the first
 * level still needing a choice), descends on each pick, and closes after an
 * environment. The root is the ScrollView itself, which react-native-screens'
 * form sheet requires to size the content.
 */
import { useLocalSearchParams } from "expo-router";
import { ScrollView, StyleSheet, Text } from "react-native";

import { PrimaryButton } from "@/components/primary-button";
import { SearchField } from "@/components/search-field";
import { typography } from "@/theme/design";

import { isScopeLevel } from "@/features/workspace/types";
import { useAppTheme } from "@/theme/use-app-theme";

import { ScopeCrumbs } from "./components/scope-crumbs";
import { ScopeList } from "./components/scope-list";
import { useScopePicker } from "./hooks/use-scope-picker";

export function ScopeScreen() {
  const { level } = useLocalSearchParams<{ level?: string }>();
  const requested = typeof level === "string" && isScopeLevel(level) ? level : null;
  const { colors } = useAppTheme();
  const picker = useScopePicker(requested);
  const { model } = picker;
  const searchLabel = `Search ${model.title.toLowerCase()}`;

  return (
    <ScrollView
      automaticallyAdjustKeyboardInsets
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      style={[styles.root, { backgroundColor: colors.surfaceBackground }]}
    >
      <Text accessibilityRole="header" style={[typography.title, { color: colors.text }]}>{model.title}</Text>
      <ScopeCrumbs colors={colors} crumbs={model.crumbs} onSelect={picker.goTo} />
      {model.searchable ? (
        <SearchField colors={colors} label={searchLabel} onChange={picker.setSearch} value={picker.search} />
      ) : null}
      <ScopeList
        colors={colors}
        emptyMessage={model.emptyMessage}
        items={model.items}
        loading={picker.loading}
        onPick={picker.pick}
        selectedId={model.selectedId}
      />
      {model.connectLabel ? (
        <PrimaryButton colors={colors} label={model.connectLabel} onPress={picker.connect} />
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    paddingBottom: 40,
    gap: 16,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
});
