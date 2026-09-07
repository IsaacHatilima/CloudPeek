import { useGlobalSearchParams, usePathname, useRootNavigationState, useRouter } from "expo-router";
import { useEffect, useState } from "react";

import { useWorkspaceSelection } from "@/features/workspace/use-workspace";
import { fileStorage } from "@/lib/file-storage";

import { createNavigationSession } from "../navigation-persistence";

export function useNavigationPersistence() {
  const pathname = usePathname();
  const { parent } = useGlobalSearchParams<{ parent?: string }>();
  const navigation = useRootNavigationState();
  const router = useRouter();
  const selection = useWorkspaceSelection();
  const [session] = useState(() => createNavigationSession(fileStorage));

  useEffect(() => {
    if (!navigation?.key) return;
    const destination = session.observe({
      parent: typeof parent === "string" ? parent : undefined,
      pathname,
      selection,
    });
    // Keep home underneath restored detail screens so Back always works.
    if (destination) router.push(destination);
  }, [navigation?.key, parent, pathname, router, selection, session]);
}
