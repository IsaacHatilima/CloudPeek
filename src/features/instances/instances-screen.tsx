import { ResourceScreen, type ResourceFeatureProps } from "@/features/resources/resource-screen";

export function InstancesScreen({ parentId }: ResourceFeatureProps) {
  return <ResourceScreen parentId={parentId} resourceId="instances" />;
}
