import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import { findResource } from "@/features/cloud-resources/catalog";
import { type CloudApi, CloudApiNotConnectedError } from "@/services/cloud-api/client";

import { refsFrom } from "./catalog-refs";
import { useWorkspaceSelection } from "./use-workspace";
import { useWorkspaceStore } from "./workspace-store";

function endpointFor(id: "applications" | "environments") {
  const endpoint = findResource(id)?.endpoint;
  if (!endpoint) throw new Error(`catalog has no endpoint for ${id}`);
  return endpoint;
}

/** Fills the application switcher for the active organization. */
export function useApplicationsCatalog(api: CloudApi | null) {
  const { organization } = useWorkspaceSelection();
  const setApplications = useWorkspaceStore((state) => state.setApplications);
  const query = useQuery({
    enabled: api !== null && organization !== null,
    queryFn: () => {
      if (!api) throw new CloudApiNotConnectedError();
      return api.list(endpointFor("applications"), {});
    },
    queryKey: ["cloud", organization?.id, "catalog", "applications"],
  });

  useEffect(() => {
    if (query.data) setApplications(refsFrom(query.data));
  }, [query.data, setApplications]);

  return query;
}

/** Fills the environment switcher for the active application. */
export function useEnvironmentsCatalog(api: CloudApi | null) {
  const { application, organization } = useWorkspaceSelection();
  const setEnvironments = useWorkspaceStore((state) => state.setEnvironments);
  const query = useQuery({
    enabled: api !== null && application !== null,
    queryFn: () => {
      if (!api || !application) throw new CloudApiNotConnectedError();
      return api.list(endpointFor("environments"), { application: application.id });
    },
    queryKey: ["cloud", organization?.id, "catalog", "environments", application?.id],
  });

  useEffect(() => {
    if (query.data) setEnvironments(refsFrom(query.data));
  }, [query.data, setEnvironments]);

  return query;
}
