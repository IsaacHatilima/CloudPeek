/**
 * Named values for the swipe shell. Gesture, spring, and reveal numbers are the
 * interaction being reused and are tuned as a set; change them together.
 */
export const SIDE_MENU_WIDTH_RATIO = 0.78;

export const IOS_LEGACY_SCREEN_CORNER_RADIUS = 55;
export const ANDROID_SCREEN_CORNER_RADIUS = 32;
export const WEB_SCREEN_CORNER_RADIUS = 28;
export const SURFACE_SHADOW = "-8px 0 40px rgba(0, 0, 0, 0.14)";

export const SIDE_MENU_LAYOUT = {
  dockHeight: 58,
  horizontalPadding: 18,
  minimumSafeAreaPadding: 16,
  scrollBottomPadding: 112,
} as const;

export const SWIPE_GESTURE = {
  activationDistance: 8,
  directionDistanceThreshold: 12,
  openPositionThreshold: 0.18,
  velocityInfluence: 0.05,
  velocityThreshold: 160,
  verticalTolerance: 18,
} as const;

export const SWIPE_SPRING = {
  damping: 32,
  mass: 0.75,
  overshootClamping: true,
  stiffness: 320,
} as const;

export const SWIPE_MENU_REVEAL = {
  fadeEndProgress: 0.5,
  fadeStartProgress: 0.08,
  startScale: 0.975,
  startVerticalOffset: 8,
} as const;
