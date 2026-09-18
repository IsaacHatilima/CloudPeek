import { ResourceScreen, type ResourceFeatureProps } from "@/features/resources/resource-screen";

export function ObjectStorageBucketsScreen({ parentId }: ResourceFeatureProps) {
  return <ResourceScreen parentId={parentId} resourceId="object-storage-buckets" />;
}
