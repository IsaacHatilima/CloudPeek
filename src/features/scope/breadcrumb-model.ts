/**
 * The header's scope line, as data. One row reads the whole path
 * (organization initial › application › environment) and, when a level is
 * still missing, turns into the prompt for it.
 */
import type {
  ApplicationRef,
  EnvironmentRef,
  OrganizationRef,
  ScopeLevel,
  WorkspaceSelection,
} from "@/features/workspace/types";

export type BreadcrumbSegment =
  | { initial: string; kind: "avatar"; level: "organization"; name: string }
  | { kind: "prompt"; label: string; level: ScopeLevel }
  | { kind: "value"; label: string; level: ScopeLevel; status?: string };

export type BreadcrumbModel = {
  accessibilityLabel: string;
  /** What tapping the row as a whole opens. */
  opens: ScopeLevel | "connect";
  segments: readonly BreadcrumbSegment[];
};

export function organizationInitial(name: string): string {
  return name.trim().charAt(0).toUpperCase() || "?";
}

function avatar(organization: OrganizationRef): BreadcrumbSegment {
  return {
    initial: organizationInitial(organization.name),
    kind: "avatar",
    level: "organization",
    name: organization.name,
  };
}

function connectPrompt(): BreadcrumbModel {
  return {
    accessibilityLabel: "No organization connected. Connect an organization",
    opens: "connect",
    segments: [{ kind: "prompt", label: "Connect an organization", level: "organization" }],
  };
}

function applicationPrompt(organization: OrganizationRef): BreadcrumbModel {
  return {
    accessibilityLabel: `Scope: ${organization.name}. Choose an application`,
    opens: "application",
    segments: [
      avatar(organization),
      { kind: "prompt", label: "Choose an application", level: "application" },
    ],
  };
}

function environmentPrompt(
  organization: OrganizationRef,
  application: ApplicationRef,
): BreadcrumbModel {
  return {
    accessibilityLabel: `Scope: ${organization.name}, ${application.name}. Choose an environment`,
    opens: "environment",
    segments: [
      avatar(organization),
      { kind: "value", label: application.name, level: "application" },
      { kind: "prompt", label: "Choose an environment", level: "environment" },
    ],
  };
}

function fullPath(
  organization: OrganizationRef,
  application: ApplicationRef,
  environment: EnvironmentRef,
  environments: readonly EnvironmentRef[],
): BreadcrumbModel {
  // The catalog is fresher than the snapshot stored with the selection.
  const status =
    environments.find((candidate) => candidate.id === environment.id)?.status ?? environment.status;
  const suffix = status ? ` (${status})` : "";

  return {
    accessibilityLabel: `Scope: ${organization.name}, ${application.name}, ${environment.name}${suffix}`,
    opens: "environment",
    segments: [
      avatar(organization),
      { kind: "value", label: application.name, level: "application" },
      { kind: "value", label: environment.name, level: "environment", status },
    ],
  };
}

export function breadcrumbModel(
  selection: WorkspaceSelection,
  environments: readonly EnvironmentRef[] = [],
): BreadcrumbModel {
  const { application, environment, organization } = selection;

  if (!organization) return connectPrompt();
  if (!application) return applicationPrompt(organization);
  if (!environment) return environmentPrompt(organization, application);
  return fullPath(organization, application, environment, environments);
}
