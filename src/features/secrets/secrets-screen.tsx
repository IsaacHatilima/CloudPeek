import { ResourceScreen, type ResourceFeatureProps } from "@/features/resources/resource-screen";

export function SecretsScreen({ parentId }: ResourceFeatureProps) {
  return <ResourceScreen parentId={parentId} resourceId="secrets" />;
}
