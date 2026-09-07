import {
  GlassView,
  isGlassEffectAPIAvailable,
  isLiquidGlassAvailable,
} from "expo-glass-effect";
import { SymbolView } from "expo-symbols";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";

import type { OrganizationRef } from "@/features/workspace/types";
import type { ColorPalette } from "@/theme/types";

import { SIDE_MENU_LAYOUT } from "../constants";

type OrganizationDockProps = {
  colors: ColorPalette;
  onPress: () => void;
  organization: OrganizationRef | null;
};

const SUPPORTS_LIQUID_GLASS =
  Platform.OS === "ios" &&
  isGlassEffectAPIAvailable() &&
  isLiquidGlassAvailable();

/** Up to two initials, e.g. "Acme Corp" → "AC". */
export function organizationInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
}

/**
 * The pill at the bottom of the menu: the active organization, and the way
 * into the organization switcher. Liquid Glass where iOS offers it, a solid
 * surface everywhere else.
 */
export function OrganizationDock(props: OrganizationDockProps) {
  if (SUPPORTS_LIQUID_GLASS) {
    return (
      <GlassView
        colorScheme="auto"
        glassEffectStyle="regular"
        isInteractive
        style={styles.surface}
      >
        <DockButton {...props} />
      </GlassView>
    );
  }

  return (
    <View
      style={[
        styles.surface,
        styles.solidSurface,
        {
          backgroundColor: props.colors.surfaceBackground,
        },
      ]}
    >
      <DockButton {...props} />
    </View>
  );
}

function DockButton({ colors, onPress, organization }: OrganizationDockProps) {
  return (
    <Pressable
      accessibilityLabel={
        organization
          ? `Organization: ${organization.name}. Switch organization`
          : "Connect an organization"
      }
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
        <Text style={[styles.initials, { color: colors.accentText }]}>
          {organization ? organizationInitials(organization.name) : "?"}
        </Text>
      </View>
      <View style={styles.labels}>
        <Text style={[styles.eyebrow, { color: colors.muted }]}>Organization</Text>
        <Text numberOfLines={1} style={[styles.name, { color: colors.text }]}>
          {organization ? organization.name : "Connect an organization"}
        </Text>
      </View>
      <SymbolView
        name={{
          ios: "chevron.up.chevron.down",
          android: "unfold_more",
          web: "unfold_more",
        }}
        size={16}
        tintColor={colors.muted}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  surface: {
    borderCurve: "continuous",
    borderRadius: 999,
    height: SIDE_MENU_LAYOUT.dockHeight,
    overflow: "hidden",
    width: "100%",
  },
  solidSurface: {
    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.1)",
  },
  button: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 10,
    paddingRight: 18,
  },
  avatar: {
    alignItems: "center",
    borderRadius: 20,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  initials: {
    fontSize: 15,
    fontWeight: "700",
  },
  labels: {
    flex: 1,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  name: {
    fontSize: 15,
    fontWeight: "600",
  },
  pressed: {
    opacity: 0.55,
  },
});
