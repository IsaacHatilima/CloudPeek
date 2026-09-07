import { useCallback, useEffect, useRef, useState } from "react";
import { useSharedValue, withSpring } from "react-native-reanimated";

import { SWIPE_SPRING } from "../constants";
import { useMenuRevealStyles } from "./use-menu-reveal-styles";
import { useSwipeGesture } from "./use-swipe-gesture";

/**
 * Open/closed state of the side menu plus the shared value that moves the
 * surface. Shared values are read and written through `.get()` / `.set()` so
 * the React Compiler lint rules can tell they are Reanimated's mutable
 * handles, not React state. React only hears about the final open or closed
 * state; every frame in between stays on the UI thread.
 */
export function useSwipeMenu(menuWidth: number) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const translateX = useSharedValue(0);
  const gestureStartX = useSharedValue(0);
  const previousMenuWidth = useRef(menuWidth);

  const animateMenu = useCallback(
    (open: boolean) => {
      setIsMenuOpen(open);
      translateX.set(withSpring(open ? menuWidth : 0, SWIPE_SPRING));
    },
    [menuWidth, translateX],
  );

  // A rotation changes the menu width; an open menu must stay fully open.
  useEffect(() => {
    if (previousMenuWidth.current === menuWidth) return;

    translateX.set(isMenuOpen ? menuWidth : 0);
    previousMenuWidth.current = menuWidth;
  }, [isMenuOpen, menuWidth, translateX]);

  const swipeGesture = useSwipeGesture({
    gestureStartX,
    menuWidth,
    onSettle: setIsMenuOpen,
    translateX,
  });
  const revealStyles = useMenuRevealStyles(translateX, menuWidth);

  return { animateMenu, isMenuOpen, swipeGesture, ...revealStyles };
}
