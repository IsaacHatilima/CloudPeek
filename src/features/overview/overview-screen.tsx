import { ResourceScreen } from "@/features/resources/resource-screen";

/**
 * The first screen: the selected application's environments, with their status.
 * The header's scope line already says where you are, so nothing repeats it.
 */
export function OverviewScreen() {
  return <ResourceScreen resourceId="environments" />;
}
