import {
  Extrapolation,
  interpolate,
  type SharedValue,
  useAnimatedStyle,
  useReducedMotion,
} from "react-native-reanimated";

import { SWIPE_MENU_REVEAL } from "../constants";

/** The menu settles into place as the surface moves aside. */
function revealTransform(progress: number) {
  "worklet";

  return [
    {
      translateY: interpolate(
        progress,
        [0, 1],
        [SWIPE_MENU_REVEAL.startVerticalOffset, 0],
        Extrapolation.CLAMP,
      ),
    },
    {
      scale: interpolate(
        progress,
        [0, 1],
        [SWIPE_MENU_REVEAL.startScale, 1],
        Extrapolation.CLAMP,
      ),
    },
  ];
}

/**
 * Derived styles for one drag position: the surface follows it exactly, the
 * menu content fades in once the surface has moved far enough to reveal it,
 * and the dock settles in without fading.
 */
export function useMenuRevealStyles(
  translateX: SharedValue<number>,
  menuWidth: number,
) {
  const reduceMotion = useReducedMotion();
  const mainAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.get() }],
  }));

  const menuContentAnimatedStyle = useAnimatedStyle(() => {
    const progress = translateX.get() / menuWidth;

    return {
      opacity: interpolate(
        progress,
        [0, SWIPE_MENU_REVEAL.fadeStartProgress, SWIPE_MENU_REVEAL.fadeEndProgress],
        [0, 0, 1],
        Extrapolation.CLAMP,
      ),
      transform: reduceMotion ? [] : revealTransform(progress),
    };
  });

  const menuDockAnimatedStyle = useAnimatedStyle(() => ({
    transform: reduceMotion ? [] : revealTransform(translateX.get() / menuWidth),
  }));

  return { mainAnimatedStyle, menuContentAnimatedStyle, menuDockAnimatedStyle };
}
