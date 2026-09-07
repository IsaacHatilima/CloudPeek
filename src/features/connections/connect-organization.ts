import type { OrganizationRef } from "@/features/workspace/types";
import {
  type CloudApi,
  type CloudApiConfig,
  describeApiError,
} from "@/services/cloud-api/client";

import type { TokenVault } from "./token-vault";

export type ConnectDependencies = {
  createApi: (config: CloudApiConfig) => Pick<CloudApi, "client">;
  /** Adds the organization to the workspace and selects it. */
  register: (organization: OrganizationRef) => void;
  vault: TokenVault;
};

export class ConnectOrganizationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConnectOrganizationError";
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/** The organization a `/meta/organization` answer describes, or null if it is not one. */
export function organizationRefFrom(body: unknown): OrganizationRef | null {
  if (!isRecord(body) || !isRecord(body.data)) return null;

  const { attributes, id } = body.data;
  if (typeof id !== "string" || !isRecord(attributes)) return null;
  if (typeof attributes.name !== "string") return null;

  return {
    id,
    name: attributes.name,
    slug: typeof attributes.slug === "string" ? attributes.slug : undefined,
  };
}

/**
 * Turns a pasted token into a connected organization: asks Cloud which
 * organization the token belongs to, stores the token under that id, and
 * registers the organization as the active one.
 */
export async function connectOrganization(
  rawToken: string,
  { createApi, register, vault }: ConnectDependencies,
): Promise<OrganizationRef> {
  const token = rawToken.trim();
  if (!token) throw new ConnectOrganizationError("Paste an API token first.");

  let body: unknown;
  try {
    ({ data: body } = await createApi({ token }).client.GET("/meta/organization"));
  } catch (error) {
    throw new ConnectOrganizationError(describeApiError(error));
  }

  const organization = organizationRefFrom(body);
  if (!organization) {
    throw new ConnectOrganizationError(
      "Laravel Cloud answered, but not with an organization.",
    );
  }

  await vault.setToken(organization.id, token);
  register(organization);
  return organization;
}
