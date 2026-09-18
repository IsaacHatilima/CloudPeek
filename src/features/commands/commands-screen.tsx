import { ResourceScreen, type ResourceFeatureProps } from "@/features/resources/resource-screen";

export function CommandsScreen({ parentId }: ResourceFeatureProps) {
  return <ResourceScreen parentId={parentId} resourceId="commands" />;
}
