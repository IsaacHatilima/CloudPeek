import { useLocalSearchParams } from "expo-router";

import { isResourceId } from "@/features/cloud-resources/catalog";
import { useAppTheme } from "@/theme/use-app-theme";

import { RESOURCE_SCREENS } from "./resource-screens";
import { UnknownResourceState } from "./resource-states";

/** `/resources/[resource]?parent=…`: resolves the named feature screen. */
export function ResourceListScreen() {
  const { parent, resource } = useLocalSearchParams<{ parent?: string; resource: string }>();
  const { colors } = useAppTheme();
  const resourceId = typeof resource === "string" ? resource : "";

  if (!isResourceId(resourceId)) {
    return <UnknownResourceState colors={colors} resource={resourceId} />;
  }

  const Screen = RESOURCE_SCREENS[resourceId];

  return (
    <Screen
      parentId={typeof parent === "string" && parent !== "" ? parent : undefined}
    />
  );
}
