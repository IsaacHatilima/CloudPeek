import { usePathname, useRouter } from "expo-router";
import { useCallback } from "react";

import type { ResourceId } from "@/features/cloud-resources/types";
import type { ScopeLevel } from "@/features/workspace/types";

import { resourceNavigationAction, resourcePath } from "../resource-navigation";

export function useShellNavigation() {
  const pathname = usePathname();
  const router = useRouter();

  const openResource = useCallback(
    (id: ResourceId) => {
      const href = resourcePath(id);
      switch (resourceNavigationAction(pathname, id)) {
        case "navigate":
          router.navigate(href);
          break;
        case "push":
          router.push(href);
          break;
        case "replace":
          router.replace(href);
          break;
        case "none":
          break;
      }
    },
    [pathname, router],
  );

  const openOverview = useCallback(() => {
    if (pathname !== "/") router.navigate("/");
  }, [pathname, router]);

  const openScope = useCallback(
    (level: ScopeLevel) => router.push({ params: { level }, pathname: "/scope" }),
    [router],
  );

  const openAccount = useCallback(() => router.push("/account"), [router]);
  const openConnect = useCallback(() => router.push("/connect"), [router]);

  return { openAccount, openConnect, openOverview, openResource, openScope } as const;
}
