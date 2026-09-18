import { ResourceScreen, type ResourceFeatureProps } from "@/features/resources/resource-screen";

export function DomainsScreen({ parentId }: ResourceFeatureProps) {
  return <ResourceScreen parentId={parentId} resourceId="domains" />;
}
