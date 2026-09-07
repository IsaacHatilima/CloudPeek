import {
  displayStatus,
  environmentSummary,
  presentResource,
  presentRows,
  toneFor,
} from "@/features/resources/presenters";

describe("presentResource", () => {
  it("shows an application by name, region, and repository", () => {
    expect(
      presentResource(
        {
          attributes: { name: "landeni-api", region: "eu-central-1", repository: { full_name: "LandeniApp/landeni-api" } },
          id: "app_1",
          type: "applications",
        },
        0,
      ),
    ).toEqual({
      avatar: { name: "landeni-api", uri: undefined },
      id: "app_1",
      openable: true,
      status: undefined,
      subtitle: "eu-central-1 · LandeniApp/landeni-api",
      title: "landeni-api",
      tone: "neutral",
    });
  });

  it("shows a deployment by commit, with branch, short hash, author, and a status tone", () => {
    const row = presentResource(
      {
        attributes: { branch_name: "main", commit_author: "Isaac", commit_hash: "abcdef1234567", commit_message: "Fix login", status: "failed" },
        id: "dep_1",
        type: "deployments",
      },
      0,
    );

    expect(row).toEqual({ id: "dep_1", openable: true, status: "failed", subtitle: "main · abcdef1 · Isaac", title: "Fix login", tone: "negative" });
  });

  it("shows an environment's status as a positive tone when running", () => {
    const row = presentResource(
      { attributes: { name: "production", status: "running", vanity_domain: "app.example.test" }, id: "env_1", type: "environments" },
      0,
    );

    expect(row.title).toBe("production");
    expect(row.subtitle).toBe("app.example.test");
    expect(row.tone).toBe("positive");
  });

  it("falls back to name-like keys for plain list entries", () => {
    expect(presentResource({ message: "Started", level: "info", logged_at: "2026-09-05T23:59:01-07:00" }, 3)).toMatchObject({
      id: "item-3",
      subtitle: "info · 5 Sep 2026, 23:59:01",
      title: "Started",
    });
    expect(presentResource({ flag: "🇩🇪", label: "Frankfurt", region: "eu-central-1" }, 0)).toMatchObject({
      subtitle: "eu-central-1",
      title: "Frankfurt",
    });
  });

  it("never throws on something that is not an object", () => {
    expect(presentResource("nope", 7)).toEqual({ id: "7", openable: false, title: "Item", tone: "neutral" });
  });
});

describe("toneFor", () => {
  it("maps Cloud statuses to a tone and leaves the rest neutral", () => {
    expect(toneFor("available")).toBe("positive");
    expect(toneFor("Deploying")).toBe("pending");
    expect(toneFor("stopped")).toBe("negative");
    expect(toneFor("hibernating")).toBe("neutral");
    expect(toneFor(undefined)).toBe("neutral");
  });
});

describe("dotted statuses", () => {
  it("shows and tones the last segment of an event-style status", () => {
    expect(displayStatus("deployment.succeeded")).toBe("succeeded");
    expect(displayStatus(undefined)).toBeUndefined();
    expect(toneFor("deployment.succeeded")).toBe("positive");
    expect(toneFor("deployment.failed")).toBe("negative");
    expect(
      presentResource(
        { attributes: { commit_message: "Ship", status: "deployment.succeeded" }, id: "dep_1", type: "deployments" },
        0,
      ),
    ).toMatchObject({ status: "succeeded", tone: "positive" });
  });
});

describe("applications with included environments", () => {
  const application = (id: string, environmentIds: string[]) => ({
    attributes: { name: id, region: "eu-central-1" },
    id,
    relationships: { environments: { data: environmentIds.map((envId) => ({ id: envId, type: "environments" })) } },
    type: "applications",
  });
  const environment = (id: string, status: string) => ({
    attributes: { name: id, status },
    id,
    type: "environments",
  });

  it("shows running when every environment runs", () => {
    const [row] = presentRows({
      data: [application("api", ["env_1"])],
      included: [environment("env_1", "running")],
    });

    expect(row).toMatchObject({ status: "running", subtitle: "eu-central-1 · 1 environment", tone: "positive" });
  });

  it("shows the mix when only some environments run", () => {
    const [row] = presentRows({
      data: [application("api", ["env_1", "env_2"])],
      included: [environment("env_1", "running"), environment("env_2", "hibernating")],
    });

    expect(row).toMatchObject({ status: "1/2 running", subtitle: "eu-central-1 · 2 environments", tone: "pending" });
  });

  it("shows the environments' state when none runs", () => {
    const [row] = presentRows({
      data: [application("api", ["env_1"])],
      included: [environment("env_1", "stopped")],
    });

    expect(row).toMatchObject({ status: "stopped", tone: "negative" });
  });

  it("shows no status without included environments", () => {
    const [row] = presentRows({ data: [application("api", ["env_1"])] });

    expect(row?.status).toBeUndefined();
    expect(row?.subtitle).toBe("eu-central-1");
  });

  it("presents a single resource answer as one row", () => {
    expect(presentRows({ data: { attributes: { name: "Acme", slug: "acme" }, id: "org_1", type: "organizations" } })).toHaveLength(1);
    expect(presentRows(undefined)).toEqual([]);
  });
});

describe("environmentSummary", () => {
  it("is undefined with no environments", () => {
    expect(environmentSummary([])).toBeUndefined();
  });
});

describe("application avatars", () => {
  it("carries the avatar URL when Cloud has one and the name for initials otherwise", () => {
    const withAvatar = presentResource(
      { attributes: { avatar_url: "https://cdn/x.png", name: "landeni-api" }, id: "a", type: "applications" },
      0,
    );
    const without = presentResource(
      { attributes: { avatar_url: null, name: "landeni-website" }, id: "b", type: "applications" },
      1,
    );
    expect(withAvatar.avatar).toEqual({ name: "landeni-api", uri: "https://cdn/x.png" });
    expect(without.avatar).toEqual({ name: "landeni-website", uri: undefined });
    expect(withAvatar.openable).toBe(true);
    expect(presentResource({ message: "log line" }, 2).openable).toBe(false);
  });
});

 it.each([
  ["commands", { command: "date", started_at: "2026-09-05T10:00:01.123Z" }, "5 Sep 2026, 10:00:01"],
  ["databaseSchemas", { name: "test", created_at: "2026-09-05 10:00:01" }, "5 Sep 2026, 10:00:01"],
  ["database_snapshots", { type: "automatic", created_at: "2026-09-05T10:00:01+02:00" }, "automatic · 5 Sep 2026, 10:00:01"],
  ["secrets", { key: "TEST", updated_at: "2026-09-05T10:00:01Z" }, "5 Sep 2026, 10:00:01"],
])("normalizes timestamp metadata in %s lists", (type, attributes, subtitle) => {
  expect(presentResource({ type, attributes, id: "test" }, 0).subtitle).toBe(subtitle);
});
