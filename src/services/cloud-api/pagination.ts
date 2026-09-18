import type { QueryParams } from "./build-path";
import type { ListEnvelope } from "./types";

/** Keep requests on the configured API; only copy pagination values from links. */
export function nextPageQuery(page: ListEnvelope, current: QueryParams = {}): QueryParams | undefined {
  if (page.data.length === 0) return undefined;
  const cursor = page.meta && "cursor" in page.meta ? page.meta.cursor : undefined;
  if (typeof cursor === "string" && cursor !== "" && cursor !== current.cursor) {
    return { ...current, cursor };
  }
  const next = page.links?.next;
  if (next) {
    try {
      const value = new URL(next, "https://pagination.invalid").searchParams.get("page");
      const number = Number(value);
      if (value && Number.isSafeInteger(number) && number > Number(current.page ?? 1)) {
        return { ...current, page: number };
      }
    } catch {
      // Malformed links can still have valid Laravel paginator metadata.
    }
  }
  const pageNumber = page.meta?.current_page;
  const last = page.meta?.last_page;
  if (typeof pageNumber === "number" && typeof last === "number" && pageNumber < last && pageNumber >= Number(current.page ?? 1)) {
    return { ...current, page: pageNumber + 1 };
  }
  return undefined;
}

/** Preserve included relationships and remove duplicate JSON:API records between pages. */
export function mergePages(pages: readonly ListEnvelope[]): ListEnvelope {
  const records = new Set<string>();
  const included = new Map<string, NonNullable<ListEnvelope["included"]>[number]>();
  const data = pages.flatMap((page) => {
    for (const item of page.included ?? []) included.set(`${item.type}:${item.id}`, item);
    return page.data.filter((item) => {
      if (typeof item.id !== "string" || typeof item.type !== "string") return true;
      const key = `${item.type}:${item.id}`;
      if (records.has(key)) return false;
      records.add(key);
      return true;
    });
  });
  return { ...pages[pages.length - 1], data, included: [...included.values()] };
}
