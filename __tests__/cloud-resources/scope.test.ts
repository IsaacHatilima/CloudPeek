import {
  describeMissingScope,
  resolveScope,
} from "@/features/cloud-resources/scope";
import type { WorkspaceSelection } from "@/features/workspace/types";

const acme = { id: "org_1", name: "Acme" };
const shop = { id: "app_1", name: "Shop" };
const production = { id: "env_1", name: "Production" };

const nothing: WorkspaceSelection = {
  application: null,
  environment: null,
  organization: null,
};
const orgOnly: WorkspaceSelection = { ...nothing, organization: acme };
const orgAndApp: WorkspaceSelection = { ...orgOnly, application: shop };
const full: WorkspaceSelection = { ...orgAndApp, environment: production };

describe("resolveScope", () => {
  it("organization scope needs only an organization and no path params", () => {
    expect(resolveScope("organization", orgOnly)).toEqual({
      params: {},
      satisfied: true,
    });
  });

  it("reports the organization as the first thing missing", () => {
    expect(resolveScope("organization", nothing)).toEqual({
      missing: "organization",
      satisfied: false,
    });
    expect(resolveScope("environment", nothing)).toEqual({
      missing: "organization",
      satisfied: false,
    });
  });

  it("application scope maps the selected application to the path param", () => {
    expect(resolveScope("application", orgOnly)).toEqual({
      missing: "application",
      satisfied: false,
    });
    expect(resolveScope("application", orgAndApp)).toEqual({
      params: { application: "app_1" },
      satisfied: true,
    });
  });

  it("environment scope needs the whole chain", () => {
    expect(resolveScope("environment", orgAndApp)).toEqual({
      missing: "environment",
      satisfied: false,
    });
    expect(resolveScope("environment", full)).toEqual({
      params: { environment: "env_1" },
      satisfied: true,
    });
  });

  it("instance scope needs an environment first, then an instance id", () => {
    expect(resolveScope("instance", orgAndApp, "inst_1")).toEqual({
      missing: "environment",
      satisfied: false,
    });
    expect(resolveScope("instance", full)).toEqual({
      missing: "instance",
      satisfied: false,
    });
    expect(resolveScope("instance", full, "inst_1")).toEqual({
      params: { instance: "inst_1" },
      satisfied: true,
    });
  });

  it.each([
    ["databaseCluster", "database"],
    ["websocketCluster", "websocketServer"],
    ["bucket", "filesystem"],
  ] as const)(
    "%s scope needs an organization plus a parent id, sent as %s",
    (scope, param) => {
      expect(resolveScope(scope, nothing, "parent_1")).toEqual({
        missing: "organization",
        satisfied: false,
      });
      expect(resolveScope(scope, orgOnly)).toEqual({
        missing: scope,
        satisfied: false,
      });
      expect(resolveScope(scope, orgOnly, "parent_1")).toEqual({
        params: { [param]: "parent_1" },
        satisfied: true,
      });
    },
  );

  it("treats a blank parent id as missing", () => {
    expect(resolveScope("bucket", orgOnly, "   ")).toEqual({
      missing: "bucket",
      satisfied: false,
    });
  });
});

describe("describeMissingScope", () => {
  it("phrases each requirement as the action the user must take", () => {
    expect(describeMissingScope("organization")).toBe("Select an organization");
    expect(describeMissingScope("application")).toBe("Select an application");
    expect(describeMissingScope("environment")).toBe("Select an environment");
    expect(describeMissingScope("instance")).toBe("Choose an instance");
    expect(describeMissingScope("databaseCluster")).toBe(
      "Choose a database cluster",
    );
    expect(describeMissingScope("websocketCluster")).toBe(
      "Choose a WebSocket cluster",
    );
    expect(describeMissingScope("bucket")).toBe("Choose a bucket");
  });
});
