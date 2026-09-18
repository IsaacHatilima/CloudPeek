import { ResourceScreen, type ResourceFeatureProps } from "@/features/resources/resource-screen";

export function EdgeNetworksScreen({ parentId }: ResourceFeatureProps) {
  return <ResourceScreen parentId={parentId} resourceId="edge-networks" />;
}
