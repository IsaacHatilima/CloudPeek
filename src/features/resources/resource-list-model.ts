import type { RowModel } from "./presenters";

/** This filters the loaded page only; it never implies a server-wide search. */
export function filterResourceRows(rows: readonly RowModel[], search: string): readonly RowModel[] {
  const query = search.trim().toLocaleLowerCase();
  if (!query) return rows;
  return rows.filter((row) => [row.title, row.subtitle, row.status].some((value) => value?.toLocaleLowerCase().includes(query)));
}
