import type { OrganizationRef } from "@/features/workspace/types";

export type AccountItem = {
  detail?: string;
  href?: string;
  id: string;
  label: string;
};

export type AccountSection = {
  id: string;
  items: readonly AccountItem[];
  title: string;
};

export const CLOUD_API_DOCS_URL = "https://laravel.com/cloud/docs/api/introduction";

/** The account screen, as data. Access is organization-based rather than a personal sign-in. */
export function accountSections({
  organizations,
  version,
}: {
  organizations: readonly OrganizationRef[];
  version: string;
}): readonly AccountSection[] {
  return [
    {
      id: "account",
      title: "Device access",
      items: [
        {
          detail:
            "Each organization uses its own API token, kept in secure storage on this device.",
          id: "token-access",
          label: "Private by default",
        },
      ],
    },
    {
      id: "organizations",
      title: "Connected organizations",
      items:
        organizations.length === 0
          ? [
              {
                detail: "Connect one from the organization switcher with an API token.",
                id: "none",
                label: "None connected yet",
              },
            ]
          : organizations.map((organization) => ({
              detail: organization.slug,
              id: organization.id,
              label: organization.name,
            })),
    },
    {
      id: "about",
      title: "About",
      items: [
        { detail: version, id: "version", label: "Version" },
        {
          detail: "laravel.com/cloud/docs/api",
          href: CLOUD_API_DOCS_URL,
          id: "docs",
          label: "Laravel Cloud API docs",
        },
      ],
    },
  ];
}
