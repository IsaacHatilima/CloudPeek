import { SWIPE_GESTURE } from "@/features/shell/constants";
import {
  clamp,
  shouldOpenMenu,
  type SwipeEndState,
} from "@/features/shell/swipe-decision";

const menuWidth = 300;

function settle(overrides: Partial<SwipeEndState>) {
  return shouldOpenMenu({
    currentPosition: 0,
    menuWidth,
    translationX: 0,
    velocityX: 0,
    ...overrides,
  });
}

describe("clamp", () => {
  it("keeps a value inside the range", () => {
    expect(clamp(-5, 0, menuWidth)).toBe(0);
    expect(clamp(150, 0, menuWidth)).toBe(150);
    expect(clamp(900, 0, menuWidth)).toBe(menuWidth);
  });
});

describe("shouldOpenMenu", () => {
  it("opens on a fast rightward flick even before the distance threshold", () => {
    expect(
      settle({
        currentPosition: 5,
        translationX: 5,
        velocityX: SWIPE_GESTURE.velocityThreshold + 1,
      }),
    ).toBe(true);
  });

  it("closes on a fast leftward flick", () => {
    expect(
      settle({
        currentPosition: menuWidth - 5,
        translationX: -5,
        velocityX: -(SWIPE_GESTURE.velocityThreshold + 1),
      }),
    ).toBe(false);
  });

  it("follows a slow drag once it passes the distance threshold", () => {
    const distance = SWIPE_GESTURE.directionDistanceThreshold + 1;

    expect(settle({ translationX: distance })).toBe(true);
    expect(settle({ translationX: -distance })).toBe(false);
  });

  it("lets a flick back override the drag that preceded it", () => {
    expect(
      settle({ currentPosition: 20, translationX: 20, velocityX: -1000 }),
    ).toBe(false);
  });

  it("settles by position when the release shows no intent", () => {
    const threshold = menuWidth * SWIPE_GESTURE.openPositionThreshold;

    expect(
      settle({ currentPosition: threshold + 1, translationX: 2, velocityX: 10 }),
    ).toBe(true);
    expect(settle({ currentPosition: 10, translationX: 2, velocityX: 10 })).toBe(
      false,
    );
  });
});
