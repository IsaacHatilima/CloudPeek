import { StyleSheet, View, type ViewStyle } from "react-native";
import Animated, { type AnimatedStyle } from "react-native-reanimated";

import type { ResourceId } from "@/features/cloud-resources/types";
import type { ScopeLevel } from "@/features/workspace/types";
import { useWorkspaceSelection } from "@/features/workspace/use-workspace";
import type { ColorPalette } from "@/theme/types";

import { SIDE_MENU_LAYOUT } from "../constants";
import { OrganizationDock } from "./organization-dock";
import { SideMenuBrand } from "./side-menu-brand";
import { SideMenuSections } from "./side-menu-sections";

type SideMenuProps = {
  activeResourceId: string | null;
  colors: ColorPalette;
  contentAnimatedStyle: AnimatedStyle<ViewStyle>;
  dockAnimatedStyle: AnimatedStyle<ViewStyle>;
  menuWidth: number;
  onOpenScope: (level: ScopeLevel) => void;
  onSelectOverview: () => void;
  onSelectResource: (id: ResourceId) => void;
  safeAreaBottom: number;
  safeAreaTop: number;
};

/** The layer under the surface: brand, resource sections, organization dock. */
export function SideMenu({
  activeResourceId,
  colors,
  contentAnimatedStyle,
  dockAnimatedStyle,
  menuWidth,
  onOpenScope,
  onSelectOverview,
  onSelectResource,
  safeAreaBottom,
  safeAreaTop,
}: SideMenuProps) {
  const { organization } = useWorkspaceSelection();
  const { horizontalPadding, minimumSafeAreaPadding } = SIDE_MENU_LAYOUT;

  return (
    <View
      style={[
        styles.menu,
        {
          backgroundColor: colors.menuBackground,
          paddingTop: Math.max(safeAreaTop, minimumSafeAreaPadding),
          width: menuWidth,
        },
      ]}
    >
      <Animated.View style={[styles.body, contentAnimatedStyle]}>
        <SideMenuBrand colors={colors} onPress={onSelectOverview} />
        <SideMenuSections
          activeResourceId={activeResourceId}
          colors={colors}
          onSelectResource={onSelectResource}
        />
      </Animated.View>

      <Animated.View
        pointerEvents="box-none"
        style={[
          styles.dock,
          {
            bottom: Math.max(safeAreaBottom, minimumSafeAreaPadding),
            left: horizontalPadding,
            right: horizontalPadding,
          },
          dockAnimatedStyle,
        ]}
      >
        <OrganizationDock
          colors={colors}
          onPress={() => onOpenScope("organization")}
          organization={organization}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  menu: {
    flex: 1,
    paddingHorizontal: SIDE_MENU_LAYOUT.horizontalPadding,
  },
  body: {
    flex: 1,
  },
  dock: {
    position: "absolute",
  },
});
