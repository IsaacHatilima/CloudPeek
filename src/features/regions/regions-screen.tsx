import { ResourceScreen, type ResourceFeatureProps } from "@/features/resources/resource-screen";

export function RegionsScreen({ parentId }: ResourceFeatureProps) {
  return <ResourceScreen parentId={parentId} resourceId="regions" />;
}
