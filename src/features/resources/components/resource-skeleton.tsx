import { StyleSheet, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withRepeat, withTiming, cancelAnimation } from "react-native-reanimated";
import { useEffect } from "react";

import type { ColorPalette } from "@/theme/types";

/** Keeps the list's shape visible while its first response arrives. */
export function ResourceSkeleton({ colors }: { colors: ColorPalette }) {
  const opacity = useSharedValue(1);
  const reduceMotion = useReducedMotion();
  useEffect(() => {
    if (!reduceMotion) opacity.set(withRepeat(withTiming(0.45, { duration: 850, easing: Easing.inOut(Easing.ease) }), -1, true));
    return () => cancelAnimation(opacity);
  }, [opacity, reduceMotion]);
  const pulse = useAnimatedStyle(() => ({ opacity: opacity.get() }));
  return (
    <View accessibilityLabel="Loading resources" accessibilityRole="progressbar" style={styles.root}>
      {[0, 1, 2].map((row) => (
        <View key={row} style={[styles.card, { backgroundColor: colors.cardBackground }]}>
          <Animated.View style={[styles.content, pulse]} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
            <View style={[styles.icon, { backgroundColor: colors.subtle }]} />
            <View style={styles.lines}>
              <View style={[styles.line, { backgroundColor: colors.subtle, width: row === 1 ? "65%" : "80%" }]} />
              <View style={[styles.line, { backgroundColor: colors.subtle, width: "45%", height: 10 }]} />
            </View>
          </Animated.View>
        </View>
      ))}
    </View>
  );
}
const styles = StyleSheet.create({
  root: { gap: 12, padding: 24 },
  card: { borderRadius: 24, padding: 20 },
  content: { alignItems: "center", flexDirection: "row", gap: 16, minHeight: 76 },
  icon: { borderRadius: 16, height: 44, width: 44 },
  lines: { flex: 1, gap: 12 },
  line: { borderRadius: 8, height: 16 },
});
