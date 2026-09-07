import type { WorkspaceSelection } from "@/features/workspace/types";

import type { ResourceId, ResourceScope } from "./types";

/** The Cloud path parameter each scope fills in, using Cloud's own names. */
export const SCOPE_PATH_PARAM: Record<ResourceScope, string | null> = {
  application: "application",
  bucket: "filesystem",
  databaseCluster: "database",
  environment: "environment",
  instance: "instance",
  organization: null,
  websocketCluster: "websocketServer",
};

/** The list a parent-scoped resource is reached from: open one of these, then its children. */
export const PARENT_RESOURCE: Record<ResourceScope, ResourceId | null> = {
  application: null,
  bucket: "object-storage-buckets",
  databaseCluster: "database-clusters",
  environment: null,
  instance: "instances",
  organization: null,
  websocketCluster: "websocket-clusters",
};

export type ScopeResolution =
  | { missing: ResourceScope; satisfied: false }
  | { params: Record<string, string>; satisfied: true };

const MISSING_SCOPE_ACTION: Record<ResourceScope, string> = {
  application: "Select an application",
  bucket: "Choose a bucket",
  databaseCluster: "Choose a database cluster",
  environment: "Select an environment",
  instance: "Choose an instance",
  organization: "Select an organization",
  websocketCluster: "Choose a WebSocket cluster",
};

function missing(scope: ResourceScope): ScopeResolution {
  return { missing: scope, satisfied: false };
}

function satisfied(params: Record<string, string>): ScopeResolution {
  return { params, satisfied: true };
}

/**
 * Works out whether a resource can be requested for the current selection.
 * Returns the path params to send, or the *first* unmet requirement in the
 * order the user has to satisfy them: organization, then application, then
 * environment, then the parent resource picked on the screen itself.
 */
export function resolveScope(
  scope: ResourceScope,
  selection: WorkspaceSelection,
  parentId?: string,
): ScopeResolution {
  const { application, environment, organization } = selection;

  if (!organization) return missing("organization");
  if (scope === "organization") return satisfied({});

  if (scope === "application") {
    return application
      ? satisfied({ application: application.id })
      : missing("application");
  }

  if (scope === "environment" || scope === "instance") {
    if (!application) return missing("application");
    if (!environment) return missing("environment");
    if (scope === "environment") {
      return satisfied({ environment: environment.id });
    }
  }

  const param = SCOPE_PATH_PARAM[scope];
  const parent = parentId?.trim();
  if (!param || !parent) return missing(scope);

  return satisfied({ [param]: parent });
}

/** The action the user must take, phrased for a button or an empty state. */
export function describeMissingScope(scope: ResourceScope): string {
  return MISSING_SCOPE_ACTION[scope];
}
