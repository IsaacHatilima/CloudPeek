import { ResourceScreen, type ResourceFeatureProps } from "@/features/resources/resource-screen";

export function DatabaseRestoresScreen({ parentId }: ResourceFeatureProps) {
  return <ResourceScreen parentId={parentId} resourceId="database-restores" />;
}
