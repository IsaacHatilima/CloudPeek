import { ScrollView, StyleSheet, Text, View } from "react-native";

import { RESOURCE_MENU } from "@/features/cloud-resources/catalog";
import type { ResourceId } from "@/features/cloud-resources/types";
import { useWorkspaceSelection } from "@/features/workspace/use-workspace";
import type { ColorPalette } from "@/theme/types";

import { SIDE_MENU_LAYOUT } from "../constants";
import { menuItemState } from "../menu-item-state";
import { SideMenuItem } from "./side-menu-item";

type SideMenuSectionsProps = {
  activeResourceId: string | null;
  colors: ColorPalette;
  onSelectResource: (id: ResourceId) => void;
};

/** The resource catalog, section by section, read against the current selection. */
export function SideMenuSections({
  activeResourceId,
  colors,
  onSelectResource,
}: SideMenuSectionsProps) {
  const selection = useWorkspaceSelection();

  return (
    <ScrollView
      contentContainerStyle={styles.sections}
      contentInsetAdjustmentBehavior="never"
      showsVerticalScrollIndicator={false}
      style={styles.scroll}
    >
      {RESOURCE_MENU.map((section) => (
        <View key={section.id}>
          <Text style={[styles.sectionTitle, { color: colors.muted }]}>
            {section.title}
          </Text>
          {section.items.map((item) => {
            const state = menuItemState(item, selection);

            return (
              <SideMenuItem
                caption={state.caption}
                colors={colors}
                dimmed={state.dimmed}
                icon={item.icon}
                key={item.id}
                label={item.label}
                onPress={() => onSelectResource(item.id)}
                selected={item.id === activeResourceId}
              />
            );
          })}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  sections: {
    paddingBottom: SIDE_MENU_LAYOUT.scrollBottomPadding,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 1.2,
    paddingBottom: 6,
    paddingHorizontal: 10,
    paddingTop: 24,
    textTransform: "uppercase",
  },
});
