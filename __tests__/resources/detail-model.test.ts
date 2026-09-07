import {
  attributeRows,
  CHILD_RESOURCES,
  childLinks,
  detailActions,
  locateItem,
} from "@/features/resources/detail/detail-model";

const answer = {
  data: [
    {
      attributes: { avatar_url: null, name: "landeni-website", region: "eu-west-1", repository: { full_name: "landeni/site" } },
      id: "app_2",
      relationships: { environments: { data: [{ id: "env_1", type: "environments" }] } },
      type: "applications",
    },
  ],
  included: [{ attributes: { name: "production", status: "running" }, id: "env_1", type: "environments" }],
};

describe("attributeRows", () => {
  it("shows environment variable names while masking every value without changing the source data", () => {
    const variables = [
      { key: "APP_KEY", value: "test-secret-key" },
      { key: "APP_NAME", value: "Example app" },
      { key: "EMPTY", value: "" },
    ];
    const before = JSON.stringify(variables);
    const rows = attributeRows({ environment_variables: variables });

    expect(rows).toEqual([{
      id: "environment_variables",
      label: "Environment variables",
      masked: true,
      value: "APP_KEY = ••••••••\nAPP_NAME = ••••••••\nEMPTY = ••••••••",
    }]);
    expect(JSON.stringify(rows)).not.toContain("test-secret-key");
    expect(JSON.stringify(rows)).not.toContain("Example app");
    expect(JSON.stringify(variables)).toBe(before);
  });

  it("masks dictionary values and unexpected environment variable shapes", () => {
    expect(attributeRows({ environment_variables: { API_TOKEN: "test-secret" } })[0].value)
      .toBe("API_TOKEN = ••••••••");
    for (const value of ["API_TOKEN=test-secret", [{ value: "test-secret" }], 123, true]) {
      expect(attributeRows({ environment_variables: value })[0].value).toBe("••••••••");
    }
    for (const value of [[], {}, null, undefined, ""]) {
      expect(attributeRows({ environment_variables: value })).toEqual([]);
    }
  });

  it("labels values, hides empties and the avatar, and flattens scalars", () => {
    const rows = attributeRows({
      avatar_url: "https://x/y.png",
      created_at: "2026-09-05T10:00:00Z",
      empty: "",
      is_public: false,
      nothing: null,
      regions: ["eu", "us"],
      repository: { full_name: "org/repo" },
      size: 3,
      tags: [],
    });
    expect(rows).toEqual([
      { id: "created_at", label: "Created at", value: "5 Sep 2026, 10:00:00" },
      { id: "is_public", label: "Is public", value: "No" },
      { id: "regions", label: "Regions", value: "eu, us" },
      { id: "repository", label: "Repository", value: "org/repo", href: "https://github.com/org/repo" },
      { id: "size", label: "Size", value: "3" },
    ]);
  });
});

describe("locateItem", () => {
  it("finds an item by id and presents it with its included relations", () => {
    const located = locateItem(answer, "app_2");
    expect(located?.attributes.name).toBe("landeni-website");
    expect(located?.row).toMatchObject({
      avatar: { name: "landeni-website", uri: undefined },
      id: "app_2",
      openable: true,
      status: "running",
      subtitle: "eu-west-1 · landeni/site · 1 environment",
      title: "landeni-website",
    });
  });

  it("returns null when the answer is missing or the id is not in it", () => {
    expect(locateItem(undefined, "app_2")).toBeNull();
    expect(locateItem(answer, "app_9")).toBeNull();
    expect(locateItem({ data: { attributes: { name: "Org" }, id: "org_1", type: "organizations" } }, "org_1")?.row.title).toBe("Org");
  });
});

describe("childLinks", () => {
  it("lists the child resources of a cluster, including the restore that has no list", () => {
    const links = childLinks("database-clusters");
    expect(links.map((link) => [link.item.id, link.listable, link.create?.operationId])).toEqual([
      ["databases", true, "public.databases.clusters.databases.store"],
      ["database-snapshots", true, "public.databases.clusters.snapshots.store"],
      ["database-restores", false, "public.databases.clusters.restore"],
    ]);
    expect(childLinks("applications")).toEqual([]);
    expect(Object.keys(CHILD_RESOURCES)).toHaveLength(4);
  });
});

describe("detailActions", () => {
  it("orders update, commands, delete, with the item's id in the params", () => {
    const actions = detailActions("applications", {}, "app_2");
    expect(actions.map((action) => [action.kind, action.label, action.input, action.destructive])).toEqual([
      ["update", "Update application", true, false],
      ["command", "Upload application avatar", true, false],
      ["command", "Delete application avatar", false, true],
      ["remove", "Delete application", false, true],
    ]);
    expect(actions[0].params).toEqual({ application: "app_2" });
  });

  it("keeps the parent's params for nested resources and gives none to create-only ones", () => {
    const remove = detailActions("databases", { database: "cluster_1" }, "schema_1").find((a) => a.kind === "remove");
    expect(remove?.params).toEqual({ database: "cluster_1", schema: "schema_1" });
    expect(detailActions("deployments", { environment: "env_1" }, "dep_1")).toEqual([]);
    const retry = detailActions("instances", { environment: "env_1" }, "inst_1").find(
      (a) => a.id === "public.instances.failed-jobs.retry",
    );
    expect(retry?.input).toBe(true);
  });
});
