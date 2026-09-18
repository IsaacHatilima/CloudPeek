import { ResourceScreen, type ResourceFeatureProps } from "@/features/resources/resource-screen";

export function DedicatedClustersScreen({ parentId }: ResourceFeatureProps) {
  return <ResourceScreen parentId={parentId} resourceId="dedicated-clusters" />;
}
