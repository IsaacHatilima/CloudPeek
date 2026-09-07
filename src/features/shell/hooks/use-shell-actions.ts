import { useRouter } from "expo-router";
import { useCallback, useMemo } from "react";

import type { ResourceId } from "@/features/cloud-resources/types";
import type { ScopeLevel } from "@/features/workspace/types";

import { useShellNavigation } from "./use-shell-navigation";

/** Everything the menu and header can do, each closing the menu first. */
export function useShellActions(animateMenu: (open: boolean) => void) {
  const router = useRouter();
  const { openAccount, openConnect, openOverview, openResource, openScope } =
    useShellNavigation();

  /** Wraps a navigation so the menu closes before it runs. */
  const closing = useCallback(
    <T extends unknown[]>(go: (...args: T) => void) =>
      (...args: T) => {
        animateMenu(false);
        go(...args);
      },
    [animateMenu],
  );

  const selectResource = useMemo(() => closing((id: ResourceId) => openResource(id)), [closing, openResource]);
  const selectOverview = useMemo(() => closing(openOverview), [closing, openOverview]);
  const selectScope = useMemo(() => closing((level: ScopeLevel) => openScope(level)), [closing, openScope]);
  const selectConnect = useMemo(() => closing(openConnect), [closing, openConnect]);
  const selectAccount = useMemo(() => closing(openAccount), [closing, openAccount]);
  const openMenu = useCallback(() => animateMenu(true), [animateMenu]);
  const closeMenu = useCallback(() => animateMenu(false), [animateMenu]);
  /** Leaves a pushed item screen; the header shows it in place of the menu button. */
  const goBack = useCallback(() => {
    if (router.canGoBack()) router.back();
  }, [router]);

  return {
    closeMenu,
    goBack,
    openMenu,
    selectAccount,
    selectConnect,
    selectOverview,
    selectResource,
    selectScope,
  } as const;
}
