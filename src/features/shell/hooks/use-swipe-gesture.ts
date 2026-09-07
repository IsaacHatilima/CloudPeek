import { useMemo } from "react";
import { Gesture } from "react-native-gesture-handler";
import { type SharedValue, withSpring } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

import { SWIPE_GESTURE, SWIPE_SPRING } from "../constants";
import { clamp, shouldOpenMenu } from "../swipe-decision";

type SwipeGestureOptions = {
  gestureStartX: SharedValue<number>;
  menuWidth: number;
  onSettle: (open: boolean) => void;
  translateX: SharedValue<number>;
};

/**
 * The pan that drags the surface: horizontal only (a vertical move fails it
 * so lists keep scrolling), clamped to the menu width, and settling open or
 * closed on release. Everything but `onSettle` stays on the UI thread.
 */
export function useSwipeGesture({
  gestureStartX,
  menuWidth,
  onSettle,
  translateX,
}: SwipeGestureOptions) {
  return useMemo(
    () =>
      Gesture.Pan()
        .maxPointers(1)
        .activeOffsetX([
          -SWIPE_GESTURE.activationDistance,
          SWIPE_GESTURE.activationDistance,
        ])
        .failOffsetY([
          -SWIPE_GESTURE.verticalTolerance,
          SWIPE_GESTURE.verticalTolerance,
        ])
        .onBegin(() => {
          gestureStartX.set(translateX.get());
        })
        .onUpdate((event) => {
          translateX.set(
            clamp(gestureStartX.get() + event.translationX, 0, menuWidth),
          );
        })
        .onEnd((event) => {
          const shouldOpen = shouldOpenMenu({
            currentPosition: translateX.get(),
            menuWidth,
            translationX: event.translationX,
            velocityX: event.velocityX,
          });

          translateX.set(withSpring(shouldOpen ? menuWidth : 0, SWIPE_SPRING));
          scheduleOnRN(onSettle, shouldOpen);
        }),
    [gestureStartX, menuWidth, onSettle, translateX],
  );
}
