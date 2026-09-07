import { useLocalSearchParams } from "expo-router";

import { ResourceScreen } from "./resource-screen";

/** `/resources/[resource]?parent=…`: validates the params, then hands off to ResourceScreen. */
export function ResourceListScreen() {
  const { parent, resource } = useLocalSearchParams<{ parent?: string; resource: string }>();

  return (
    <ResourceScreen
      parentId={typeof parent === "string" && parent !== "" ? parent : undefined}
      resourceId={typeof resource === "string" ? resource : ""}
    />
  );
}
