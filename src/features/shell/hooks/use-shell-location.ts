import { usePathname, useRootNavigationState } from "expo-router";

import { activeResourceId, isDetailPath } from "../resource-navigation";
import { shellTitle } from "../shell-title";

/** Where the shell is: the resource to highlight in the menu, the header title, and whether an item is open. */
export function useShellLocation() {
  const pathname = usePathname();
  const navigationState = useRootNavigationState();

  return {
    activeResourceId: activeResourceId(pathname),
    isDetail: isDetailPath(pathname),
    title: shellTitle(pathname, navigationState),
  } as const;
}
