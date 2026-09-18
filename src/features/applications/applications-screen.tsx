import { ResourceScreen, type ResourceFeatureProps } from "@/features/resources/resource-screen";

export function ApplicationsScreen({ parentId }: ResourceFeatureProps) {
  return <ResourceScreen parentId={parentId} resourceId="applications" />;
}
