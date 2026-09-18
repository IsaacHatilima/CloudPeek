import { ResourceScreen, type ResourceFeatureProps } from "@/features/resources/resource-screen";

export function DatabaseClustersScreen({ parentId }: ResourceFeatureProps) {
  return <ResourceScreen parentId={parentId} resourceId="database-clusters" />;
}
