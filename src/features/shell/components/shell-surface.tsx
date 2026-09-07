import type { PropsWithChildren } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  View,
  type ViewStyle,
} from "react-native";
import Animated, { type AnimatedStyle } from "react-native-reanimated";

import { ScopeBreadcrumb } from "@/features/scope/components/scope-breadcrumb";
import type { ScopeLevel } from "@/features/workspace/types";
import type { ColorPalette } from "@/theme/types";

import ScreenCornerSurface from "../../../../modules/screen-corner-surface";
import {
  ANDROID_SCREEN_CORNER_RADIUS,
  IOS_LEGACY_SCREEN_CORNER_RADIUS,
  SURFACE_SHADOW,
  WEB_SCREEN_CORNER_RADIUS,
} from "../constants";
import { ShellHeader } from "./shell-header";

const FALLBACK_CORNER_RADIUS = Platform.select({
  android: ANDROID_SCREEN_CORNER_RADIUS,
  default: WEB_SCREEN_CORNER_RADIUS,
  ios: IOS_LEGACY_SCREEN_CORNER_RADIUS,
});

type ShellSurfaceProps = PropsWithChildren<{
  animatedStyle: AnimatedStyle<ViewStyle>;
  colors: ColorPalette;
  isMenuOpen: boolean;
  onBack?: () => void;
  onCloseMenu: () => void;
  onConnect: () => void;
  onOpenAccount: () => void;
  onOpenMenu: () => void;
  onOpenScope: (level: ScopeLevel) => void;
  safeAreaTop: number;
  title: string;
}>;

/**
 * The moving surface: a screen-shaped, shadow-casting layer that carries the
 * header, the context bar, and the navigator, and that closes the menu when
 * tapped while the menu is open.
 */
export function ShellSurface({
  animatedStyle,
  children,
  colors,
  isMenuOpen,
  onBack,
  onCloseMenu,
  onConnect,
  onOpenAccount,
  onOpenMenu,
  onOpenScope,
  safeAreaTop,
  title,
}: ShellSurfaceProps) {
  return (
    <Animated.View style={[StyleSheet.absoluteFill, animatedStyle]}>
      <ScreenCornerSurface
        castsShadow
        fallbackRadius={FALLBACK_CORNER_RADIUS}
        fallbackShadow={SURFACE_SHADOW}
        style={[styles.shadow, { backgroundColor: colors.surfaceBackground }]}
      >
        <ScreenCornerSurface
          fallbackRadius={FALLBACK_CORNER_RADIUS}
          style={[styles.surface, { backgroundColor: colors.surfaceBackground }]}
        >
          <View
            accessibilityElementsHidden={isMenuOpen}
            importantForAccessibility={isMenuOpen ? "no-hide-descendants" : "auto"}
            style={styles.content}
          >
            <ShellHeader
              colors={colors}
              onBack={onBack}
              onOpenAccount={onOpenAccount}
              onOpenMenu={onOpenMenu}
              safeAreaTop={safeAreaTop}
              title={title}
            >
              <ScopeBreadcrumb colors={colors} onConnect={onConnect} onOpen={onOpenScope} />
            </ShellHeader>
            <View style={styles.screen}>{children}</View>
          </View>
          <MenuCloser active={isMenuOpen} onPress={onCloseMenu} />
        </ScreenCornerSurface>
      </ScreenCornerSurface>
    </Animated.View>
  );
}

/** Covers the surface while the menu is open so any tap closes the menu. */
function MenuCloser({ active, onPress }: { active: boolean; onPress: () => void }) {
  return (
    <View pointerEvents={active ? "auto" : "none"} style={StyleSheet.absoluteFill}>
      <Pressable
        accessibilityLabel="Close menu"
        accessibilityRole="button"
        onPress={onPress}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  shadow: {
    flex: 1,
    zIndex: 2,
  },
  surface: {
    flex: 1,
    overflow: "hidden",
  },
  content: {
    flex: 1,
  },
  screen: {
    flex: 1,
  },
});
