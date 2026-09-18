import { ResourceScreen, type ResourceFeatureProps } from "@/features/resources/resource-screen";

export function BackgroundProcessesScreen({ parentId }: ResourceFeatureProps) {
  return <ResourceScreen parentId={parentId} resourceId="background-processes" />;
}
