import {
  deepestOpenLevel,
  effectiveLevel,
  filterItems,
  nextLevelAfterPick,
  scopeCrumbs,
  scopeLevelModel,
  SEARCH_THRESHOLD,
} from "@/features/scope/scope-model";
import type { WorkspaceSelection } from "@/features/workspace/types";

const acme = { id: "org_1", name: "Acme", slug: "acme" };
const shop = { id: "app_1", name: "Shop", slug: "shop" };
const production = { id: "env_1", name: "production", status: "running" };
const staging = { id: "env_2", name: "staging", status: "hibernating" };

const nothing: WorkspaceSelection = { application: null, environment: null, organization: null };
const orgOnly: WorkspaceSelection = { ...nothing, organization: acme };
const orgAndApp: WorkspaceSelection = { ...orgOnly, application: shop };
const full: WorkspaceSelection = { ...orgAndApp, environment: production };

const source = (selection: WorkspaceSelection) => ({
  applications: [shop],
  environments: [production, staging],
  organizations: [acme],
  selection,
});

describe("levels", () => {
  it("pulls a request up to the first level that still needs a choice", () => {
    expect(effectiveLevel("environment", nothing)).toBe("organization");
    expect(effectiveLevel("environment", orgOnly)).toBe("application");
    expect(effectiveLevel("environment", orgAndApp)).toBe("environment");
    expect(effectiveLevel("organization", full)).toBe("organization");
  });

  it("opens the header at the first missing level, else environments", () => {
    expect(deepestOpenLevel(nothing)).toBe("organization");
    expect(deepestOpenLevel(orgOnly)).toBe("application");
    expect(deepestOpenLevel(full)).toBe("environment");
  });

  it("descends after a pick and ends after an environment", () => {
    expect(nextLevelAfterPick("organization")).toBe("application");
    expect(nextLevelAfterPick("application")).toBe("environment");
    expect(nextLevelAfterPick("environment")).toBeNull();
  });
});

describe("scopeCrumbs", () => {
  it("names the chosen levels above the current one", () => {
    expect(scopeCrumbs("environment", full).map((crumb) => [crumb.label, crumb.current])).toEqual([
      ["Acme", false],
      ["Shop", false],
      ["Environments", true],
    ]);
    expect(scopeCrumbs("organization", full).map((crumb) => crumb.label)).toEqual(["Organizations"]);
  });
});

describe("scopeLevelModel", () => {
  it("lists environments with the current one marked", () => {
    const model = scopeLevelModel("environment", source(full));

    expect(model.title).toBe("Environments");
    expect(model.items).toEqual([production, staging]);
    expect(model.selectedId).toBe("env_1");
    expect(model.connectLabel).toBeNull();
    expect(model.searchable).toBe(false);
  });

  it("offers to connect on the organization level, worded for the situation", () => {
    expect(scopeLevelModel("organization", source(full)).connectLabel).toBe("Connect another organization");
    expect(scopeLevelModel("organization", { ...source(nothing), organizations: [] }).connectLabel).toBe(
      "Connect an organization",
    );
  });

  it("explains an empty level", () => {
    expect(scopeLevelModel("application", { ...source(orgOnly), applications: [] }).emptyMessage).toBe(
      "No applications loaded for Acme yet.",
    );
    expect(scopeLevelModel("organization", { ...source(nothing), organizations: [] }).emptyMessage).toMatch(
      /API token/,
    );
  });

  it("filters by name or slug and says when nothing matches", () => {
    const many = Array.from({ length: SEARCH_THRESHOLD + 1 }, (_, index) => ({
      id: `app_${index}`,
      name: `App ${index}`,
      slug: index === 3 ? "checkout" : undefined,
    }));
    const model = scopeLevelModel("application", { ...source(orgOnly), applications: many }, "check");

    expect(model.searchable).toBe(true);
    expect(model.items.map((item) => item.id)).toEqual(["app_3"]);
    expect(scopeLevelModel("application", { ...source(orgOnly), applications: many }, "zzz").emptyMessage).toBe(
      'Nothing matches "zzz".',
    );
    expect(filterItems(many, "  ")).toBe(many);
  });
});

describe("application avatars in the scope sheet", () => {
  it("gives every application item an avatar with its URL or its name", () => {
    const model = scopeLevelModel("application", {
      applications: [
        { avatarUrl: "https://cdn/a.png", id: "a", name: "landeni-api" },
        { id: "b", name: "landeni-website" },
      ],
      environments: [],
      organizations: [{ id: "org", name: "Landeni" }],
      selection: { application: null, environment: null, organization: { id: "org", name: "Landeni" } },
    });
    expect(model.items.map((item) => item.avatar)).toEqual([
      { name: "landeni-api", uri: "https://cdn/a.png" },
      { name: "landeni-website", uri: undefined },
    ]);
    expect(model.items[0]).not.toHaveProperty("avatarUrl");
  });
});
