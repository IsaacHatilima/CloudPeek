import { ResourceScreen, type ResourceFeatureProps } from "@/features/resources/resource-screen";

export function EnvironmentLogsScreen({ parentId }: ResourceFeatureProps) {
  return <ResourceScreen parentId={parentId} resourceId="environment-logs" />;
}
