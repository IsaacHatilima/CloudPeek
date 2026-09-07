/**
 * References to the three things every screen is scoped by. They carry the
 * display name (and, when Cloud reports one, the status) as well as the id, so
 * the header can render on a cold start before anything has been fetched.
 */
export type OrganizationRef = { id: string; name: string; slug?: string; status?: string };
export type ApplicationRef = {
  avatarUrl?: string;
  id: string;
  name: string;
  slug?: string;
  status?: string;
};
export type EnvironmentRef = { id: string; name: string; slug?: string; status?: string };

export type WorkspaceSelection = {
  application: ApplicationRef | null;
  environment: EnvironmentRef | null;
  organization: OrganizationRef | null;
};

/** The three levels of scope, outermost first. */
export const SCOPE_LEVELS = ["organization", "application", "environment"] as const;

export type ScopeLevel = (typeof SCOPE_LEVELS)[number];

export function isScopeLevel(value: string): value is ScopeLevel {
  return (SCOPE_LEVELS as readonly string[]).includes(value);
}
