/**
 * The swipe shell: the side menu mounted underneath a single moving surface
 * that carries the header, the context bar, and the navigator.
 *
 * Reanimated and Gesture Handler update only the surface's horizontal
 * translation on the UI thread, so the surface keeps its continuous corner for
 * the whole gesture (see `modules/screen-corner-surface`). React only hears
 * about the final open/closed state.
 */
import type { PropsWithChildren } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import { GestureDetector } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useConnectedOrganizations } from "@/features/workspace/use-workspace";

import { useAppTheme } from "@/theme/use-app-theme";

import { ShellSurface } from "./components/shell-surface";
import { SideMenu } from "./components/side-menu";
import { SIDE_MENU_WIDTH_RATIO } from "./constants";
import { useShellActions } from "./hooks/use-shell-actions";
import { useShellLocation } from "./hooks/use-shell-location";
import { useSwipeMenu } from "./hooks/use-swipe-menu";

export function ShellLayout({ children }: PropsWithChildren) {
  const { width: screenWidth } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const location = useShellLocation();
  const organizations = useConnectedOrganizations();
  const menuWidth = screenWidth * SIDE_MENU_WIDTH_RATIO;
  const menu = useSwipeMenu(menuWidth);
  const actions = useShellActions(menu.animateMenu);

  return (
    <GestureDetector gesture={menu.swipeGesture}>
      <View style={[styles.root, { backgroundColor: colors.menuBackground }]}>
        <MenuLayer isMenuOpen={menu.isMenuOpen}>
          <SideMenu
            activeResourceId={location.activeResourceId}
            colors={colors}
            contentAnimatedStyle={menu.menuContentAnimatedStyle}
            dockAnimatedStyle={menu.menuDockAnimatedStyle}
            menuWidth={menuWidth}
            onOpenScope={actions.selectScope}
            onSelectOverview={actions.selectOverview}
            onSelectResource={actions.selectResource}
            safeAreaBottom={insets.bottom}
            safeAreaTop={insets.top}
          />
        </MenuLayer>
        <ShellSurface
          animatedStyle={menu.mainAnimatedStyle}
          colors={colors}
          isMenuOpen={menu.isMenuOpen}
          onBack={location.isDetail ? actions.goBack : undefined}
          onCloseMenu={actions.closeMenu}
          onConnect={actions.selectConnect}
          onOpenAccount={actions.selectAccount}
          onOpenMenu={actions.openMenu}
          onOpenScope={actions.selectScope}
          safeAreaTop={insets.top}
          title={organizations.length > 0 ? location.title : "Welcome"}
        >
          {children}
        </ShellSurface>
      </View>
    </GestureDetector>
  );
}

/** Keeps the menu out of the accessibility tree and untouchable while closed. */
function MenuLayer({ children, isMenuOpen }: PropsWithChildren<{ isMenuOpen: boolean }>) {
  return (
    <View
      accessibilityElementsHidden={!isMenuOpen}
      importantForAccessibility={isMenuOpen ? "auto" : "no-hide-descendants"}
      pointerEvents={isMenuOpen ? "auto" : "none"}
      style={StyleSheet.absoluteFill}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    overflow: "hidden",
  },
});
