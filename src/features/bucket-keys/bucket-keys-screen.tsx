import { ResourceScreen, type ResourceFeatureProps } from "@/features/resources/resource-screen";

export function BucketKeysScreen({ parentId }: ResourceFeatureProps) {
  return <ResourceScreen parentId={parentId} resourceId="bucket-keys" />;
}
