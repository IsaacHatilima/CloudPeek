import { useRouter } from "expo-router";
import { useCallback, useState } from "react";

import { useCloudApi } from "@/features/connections/use-cloud-api";
import type { ScopeLevel } from "@/features/workspace/types";
import { useApplicationsCatalog, useEnvironmentsCatalog } from "@/features/workspace/use-catalogs";
import {
  useApplications,
  useConnectedOrganizations,
  useEnvironments,
  useWorkspaceSelection,
} from "@/features/workspace/use-workspace";
import { useWorkspaceStore } from "@/features/workspace/workspace-store";

import {
  deepestOpenLevel,
  effectiveLevel,
  nextLevelAfterPick,
  type ScopeItem,
  scopeLevelModel,
} from "../scope-model";

/**
 * Drives the scope sheet: which level shows, the search, and what a pick does
 * (select in the store, then descend, or close after an environment).
 */
export function useScopePicker(requested: ScopeLevel | null) {
  const router = useRouter();
  const selection = useWorkspaceSelection();
  const organizations = useConnectedOrganizations();
  const applications = useApplications();
  const environments = useEnvironments();
  const selectOrganization = useWorkspaceStore((state) => state.selectOrganization);
  const selectApplication = useWorkspaceStore((state) => state.selectApplication);
  const selectEnvironment = useWorkspaceStore((state) => state.selectEnvironment);
  const api = useCloudApi();
  const applicationsQuery = useApplicationsCatalog(api);
  const environmentsQuery = useEnvironmentsCatalog(api);
  const [level, setLevel] = useState<ScopeLevel>(() =>
    effectiveLevel(requested ?? deepestOpenLevel(selection), selection),
  );
  const [search, setSearch] = useState("");

  const model = scopeLevelModel(level, { applications, environments, organizations, selection }, search);
  const loading =
    (model.level === "application" && applicationsQuery.isFetching) ||
    (model.level === "environment" && environmentsQuery.isFetching);

  const goTo = useCallback((next: ScopeLevel) => {
    setLevel(next);
    setSearch("");
  }, []);

  const pick = useCallback(
    (item: ScopeItem) => {
      if (model.level === "organization") selectOrganization(item);
      if (model.level === "application") selectApplication(item);
      if (model.level === "environment") selectEnvironment(item);

      const next = nextLevelAfterPick(model.level);
      if (next) goTo(next);
      else if (router.canGoBack()) router.back();
    },
    [goTo, model.level, router, selectApplication, selectEnvironment, selectOrganization],
  );

  const connect = useCallback(() => router.push("/connect"), [router]);

  return { connect, goTo, loading, model, pick, search, setSearch } as const;
}
