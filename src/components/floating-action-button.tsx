import {
  GlassView,
  isGlassEffectAPIAvailable,
  isLiquidGlassAvailable,
} from "expo-glass-effect";
import { SymbolView, type SymbolViewProps } from "expo-symbols";
import { Platform, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Touchable } from "./touchable";

import type { ColorPalette } from "@/theme/types";

const SUPPORTS_LIQUID_GLASS =
  Platform.OS === "ios" &&
  isGlassEffectAPIAvailable() &&
  isLiquidGlassAvailable();

export const FAB_SIZE = 56;
const MARGIN = 20;

type FloatingActionButtonProps = {
  accessibilityLabel: string;
  colors: ColorPalette;
  icon: SymbolViewProps["name"];
  onPress: () => void;
};

/**
 * The one primary action of a screen, floating bottom-right above the safe
 * area: accent-tinted Liquid Glass where iOS offers it, a solid accent disc
 * everywhere else. Screens that show it pad their content by `FAB_SIZE` plus
 * margins so the last row can scroll clear of it.
 */
export function FloatingActionButton({
  accessibilityLabel,
  colors,
  icon,
  onPress,
}: FloatingActionButtonProps) {
  const insets = useSafeAreaInsets();
  const placement = { bottom: insets.bottom + MARGIN, right: MARGIN };
  const button = (
    <Touchable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      hitSlop={8}
      onPress={onPress}
      style={styles.button}
    >
      <SymbolView name={icon} size={24} tintColor={colors.accentText} weight="semibold" />
    </Touchable>
  );

  if (SUPPORTS_LIQUID_GLASS) {
    return (
      <GlassView
        colorScheme="auto"
        glassEffectStyle="regular"
        isInteractive
        style={[styles.surface, placement]}
        tintColor={colors.accent}
      >
        {button}
      </GlassView>
    );
  }

  return (
    <View style={[styles.surface, styles.solid, placement, { backgroundColor: colors.accent }]}>
      {button}
    </View>
  );
}

const styles = StyleSheet.create({
  surface: {
    borderRadius: FAB_SIZE / 2,
    height: FAB_SIZE,
    overflow: "hidden",
    position: "absolute",
    width: FAB_SIZE,
  },
  solid: {
    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.25)",
  },
  button: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
});
