import type { ReactNode } from "react";
import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from "react-native";
import Animated, { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from "react-native-reanimated";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
type TouchableProps = Omit<PressableProps, "style" | "children"> & {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

/** Immediate, interruptible feedback. Transform and opacity stay on the UI thread. */
export function Touchable({ children, disabled, onPressIn, onPressOut, style, ...props }: TouchableProps) {
  const progress = useSharedValue(0);
  const reduceMotion = useReducedMotion();
  const interactive = props.onPress !== undefined || props.onLongPress !== undefined;
  const feedback = useAnimatedStyle(() => ({
    opacity: disabled ? 0.45 : 1 - progress.get() * 0.16,
    transform: [{ scale: reduceMotion ? 1 : 1 - progress.get() * 0.018 }],
  }));
  const setPressed = (pressed: boolean) => progress.set(withTiming(pressed ? 1 : 0, {
    duration: pressed ? 100 : 160,
    easing: Easing.out(Easing.cubic),
  }));

  return (
    <AnimatedPressable
      {...props}
      disabled={disabled}
      onPressIn={(event) => { if (interactive) setPressed(true); onPressIn?.(event); }}
      onPressOut={(event) => { setPressed(false); onPressOut?.(event); }}
      style={[style, feedback]}
    >
      {children}
    </AnimatedPressable>
  );
}
