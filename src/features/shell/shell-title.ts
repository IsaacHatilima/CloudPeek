import { findResource } from "@/features/cloud-resources/catalog";

import {
  activeResourceId,
  coveredRoute,
  isSheetPath,
  type NavigationStateLike,
  routeResourceId,
} from "./resource-navigation";

export const DEFAULT_TITLE = "Overview";

/**
 * The header title for a location: the resource on screen, else the default.
 * While a sheet is open the pathname is the sheet's, so the title comes from
 * the route the sheet covers instead.
 */
export function shellTitle(
  pathname: string,
  state: NavigationStateLike | undefined,
): string {
  const covered = isSheetPath(pathname) ? coveredRoute(state) : null;
  const resourceId =
    activeResourceId(pathname) ?? (covered ? routeResourceId(covered) : null);

  return resourceId !== null
    ? (findResource(resourceId)?.label ?? DEFAULT_TITLE)
    : DEFAULT_TITLE;
}
