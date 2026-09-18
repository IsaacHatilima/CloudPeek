import { useQuery } from "@tanstack/react-query";

import { useCloudApi } from "@/features/connections/use-cloud-api";
import { useWorkspaceSelection } from "@/features/workspace/use-workspace";
import { CloudApiNotConnectedError } from "@/services/cloud-api/client";

import { DATABASE_TYPES_ENDPOINT, databaseTypesFrom } from "../database-options";

export function useDatabaseOptions(enabled: boolean) {
  const api = useCloudApi();
  const { organization } = useWorkspaceSelection();
  return useQuery({
    enabled: enabled && api !== null,
    queryKey: ["cloud", organization?.id, DATABASE_TYPES_ENDPOINT.operationId],
    queryFn: async () => {
      if (!api) throw new CloudApiNotConnectedError();
      return databaseTypesFrom((await api.list(DATABASE_TYPES_ENDPOINT, {})).data);
    },
  });
}
