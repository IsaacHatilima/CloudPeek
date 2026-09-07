import { SWIPE_GESTURE } from "./constants";

export type SwipeEndState = {
  currentPosition: number;
  menuWidth: number;
  translationX: number;
  velocityX: number;
};

export function clamp(value: number, minimum: number, maximum: number) {
  "worklet";

  return Math.min(maximum, Math.max(minimum, value));
}

/**
 * Whether the menu settles open when a pan ends. A decisive drag or flick
 * wins on direction, projected a little way ahead by its velocity so a flick
 * back overrides the drag that preceded it. An indecisive release leaves the
 * menu wherever it is, past the open threshold or not.
 */
export function shouldOpenMenu({
  currentPosition,
  menuWidth,
  translationX,
  velocityX,
}: SwipeEndState) {
  "worklet";

  const hasDirectionalIntent =
    Math.abs(translationX) > SWIPE_GESTURE.directionDistanceThreshold ||
    Math.abs(velocityX) > SWIPE_GESTURE.velocityThreshold;

  if (hasDirectionalIntent) {
    const projectedDirection =
      translationX + velocityX * SWIPE_GESTURE.velocityInfluence;

    return projectedDirection > 0;
  }

  return currentPosition > menuWidth * SWIPE_GESTURE.openPositionThreshold;
}
