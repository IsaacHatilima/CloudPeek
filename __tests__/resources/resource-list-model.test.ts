import { filterResourceRows } from "@/features/resources/resource-list-model";
import type { RowModel } from "@/features/resources/presenters";

const rows: RowModel[] = [
  { id: "1", title: "Production", subtitle: "api.example.com · PHP 8.5", status: "running", tone: "positive", openable: true },
  { id: "2", title: "Staging", status: "deploying", tone: "pending", openable: true },
  { id: "3", title: "Worker", tone: "neutral", openable: false },
];

describe("filtering the loaded resource page", () => {
  it("searches names, metadata, and statuses without case or surrounding whitespace affecting matches", () => {
    expect(filterResourceRows(rows, "  PROD  ").map((row) => row.id)).toEqual(["1"]);
    expect(filterResourceRows(rows, "PHP 8.5").map((row) => row.id)).toEqual(["1"]);
    expect(filterResourceRows(rows, "DEPLOYING").map((row) => row.id)).toEqual(["2"]);
  });
  it("clearing search returns every loaded row and leaves the original data unchanged", () => {
    expect(filterResourceRows(rows, "missing")).toEqual([]);
    expect(filterResourceRows(rows, "  ")).toBe(rows);
    expect(rows).toHaveLength(3);
  });
});
