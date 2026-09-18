import { ResourceScreen, type ResourceFeatureProps } from "@/features/resources/resource-screen";

export function DeploymentsScreen({ parentId }: ResourceFeatureProps) {
  return <ResourceScreen parentId={parentId} resourceId="deployments" />;
}
