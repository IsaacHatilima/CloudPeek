import { ResourceScreen, type ResourceFeatureProps } from "@/features/resources/resource-screen";

export function WebSocketClustersScreen({ parentId }: ResourceFeatureProps) {
  return <ResourceScreen parentId={parentId} resourceId="websocket-clusters" />;
}
