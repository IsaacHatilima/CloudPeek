import { Image, StyleSheet, Text, View } from "react-native";

import { initialsFor } from "@/lib/initials";
import type { ColorPalette } from "@/theme/types";

type AvatarProps = {
  colors: ColorPalette;
  /** What the initials come from when there is no image: "landeni-website" → "LW". */
  name: string;
  size?: number;
  uri?: string;
};

const DEFAULT_SIZE = 40;

/** A rounded image when Cloud has one, else the name's initials on a tinted disc. */
export function Avatar({ colors, name, size = DEFAULT_SIZE, uri }: AvatarProps) {
  const shape = { borderRadius: size * 0.3, height: size, width: size };

  if (uri) {
    return (
      <View style={[shape, styles.frame]}>
        <Image
          accessibilityIgnoresInvertColors
          accessibilityLabel={`${name} avatar`}
          source={{ uri }}
          style={StyleSheet.absoluteFill}
        />
      </View>
    );
  }

  return (
    <View
      accessibilityLabel={`${name} initials`}
      style={[shape, styles.fallback, { backgroundColor: colors.chipBackground }]}
    >
      <Text style={[styles.initials, { color: colors.accent, fontSize: size * 0.38 }]}>
        {initialsFor(name)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    borderCurve: "continuous",
    overflow: "hidden",
  },
  fallback: {
    alignItems: "center",
    borderCurve: "continuous",
    justifyContent: "center",
  },
  initials: {
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});
