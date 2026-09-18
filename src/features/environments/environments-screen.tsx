import { ResourceScreen, type ResourceFeatureProps } from "@/features/resources/resource-screen";

export function EnvironmentsScreen({ parentId }: ResourceFeatureProps) {
  return <ResourceScreen parentId={parentId} resourceId="environments" />;
}
