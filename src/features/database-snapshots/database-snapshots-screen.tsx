import { ResourceScreen, type ResourceFeatureProps } from "@/features/resources/resource-screen";

export function DatabaseSnapshotsScreen({ parentId }: ResourceFeatureProps) {
  return <ResourceScreen parentId={parentId} resourceId="database-snapshots" />;
}
