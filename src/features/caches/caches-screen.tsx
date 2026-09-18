import { ResourceScreen, type ResourceFeatureProps } from "@/features/resources/resource-screen";

export function CachesScreen({ parentId }: ResourceFeatureProps) {
  return <ResourceScreen parentId={parentId} resourceId="caches" />;
}
