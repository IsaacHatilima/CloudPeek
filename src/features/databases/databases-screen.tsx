import { ResourceScreen, type ResourceFeatureProps } from "@/features/resources/resource-screen";

export function DatabasesScreen({ parentId }: ResourceFeatureProps) {
  return <ResourceScreen parentId={parentId} resourceId="databases" />;
}
