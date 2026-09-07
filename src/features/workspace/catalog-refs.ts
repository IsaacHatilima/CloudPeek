import type { ApplicationRef } from "./types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/** Switcher entries from a JSON:API list: id plus a display name, slug, status, and avatar. */
export function refsFrom(list: { data: readonly unknown[] }): readonly ApplicationRef[] {
  return list.data.flatMap((item) => {
    if (!isRecord(item) || typeof item.id !== "string") return [];

    const attributes = isRecord(item.attributes) ? item.attributes : {};
    const name = typeof attributes.name === "string" ? attributes.name : item.id;
    const slug = typeof attributes.slug === "string" ? attributes.slug : undefined;
    const status = typeof attributes.status === "string" ? attributes.status : undefined;
    const avatarUrl = typeof attributes.avatar_url === "string" && attributes.avatar_url !== ""
      ? attributes.avatar_url
      : undefined;

    return [{ avatarUrl, id: item.id, name, slug, status }];
  });
}
