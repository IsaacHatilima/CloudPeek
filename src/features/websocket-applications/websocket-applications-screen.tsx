import { ResourceScreen, type ResourceFeatureProps } from "@/features/resources/resource-screen";

export function WebSocketApplicationsScreen({ parentId }: ResourceFeatureProps) {
  return <ResourceScreen parentId={parentId} resourceId="websocket-applications" />;
}
