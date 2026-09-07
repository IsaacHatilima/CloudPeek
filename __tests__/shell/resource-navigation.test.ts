import {
  activeResourceId,
  coveredResourceId,
  coveredRoute,
  isHomePath,
  type NavigationRouteLike,
  type NavigationStateLike,
  resourceNavigationAction,
  resourcePath,
  routeResourceId,
} from "@/features/shell/resource-navigation";

const overview = { name: "index" };
const deployments = {
  name: "resources/[resource]/index",
  params: { resource: "deployments" },
};
const sheet = { name: "scope", params: { level: "organization" } };
const connect = { name: "connect" };

function root(routes: readonly NavigationRouteLike[]): NavigationStateLike {
  return { routes: [{ name: "__root", state: { routes } }] };
}

describe("resourcePath", () => {
  it("keeps environments at home and everything else under /resources", () => {
    expect(resourcePath("environments")).toBe("/");
    expect(resourcePath("usage")).toBe("/resources/usage");
    expect(resourcePath("billing")).toBe("/resources/billing");
    expect(resourcePath("deployments")).toBe("/resources/deployments");
  });
});

describe("activeResourceId", () => {
  it("reads a pushed resource from its path", () => {
    expect(activeResourceId("/resources/deployments")).toBe("deployments");
    expect(activeResourceId("/resources/usage")).toBe("usage");
  });

  it("recognises home as the environments list", () => {
    expect(activeResourceId("/")).toBe("environments");
  });

  it("is null on sheets, the account modal, and paths that are not routes", () => {
    expect(activeResourceId("/scope")).toBeNull();
    expect(activeResourceId("/connect")).toBeNull();
    expect(activeResourceId("/account")).toBeNull();
    expect(activeResourceId("/usage")).toBeNull();
    expect(activeResourceId("/resources/deployments/extra/more")).toBeNull();
  });
});

describe("isHomePath", () => {
  it("knows the one home path and nothing else", () => {
    expect(isHomePath("/")).toBe(true);
    expect(isHomePath("/resources/usage")).toBe(false);
    expect(isHomePath("/scope")).toBe(false);
  });
});

describe("resourceNavigationAction", () => {
  it("pushes a resource from home so back returns there", () => {
    expect(resourceNavigationAction("/", "deployments")).toBe("push");
    expect(resourceNavigationAction("/", "usage")).toBe("push");
  });

  it("replaces between pushed resources so the stack stays shallow", () => {
    expect(resourceNavigationAction("/resources/deployments", "caches")).toBe("replace");
    expect(resourceNavigationAction("/resources/deployments", "usage")).toBe("replace");
  });

  it("does nothing when the resource is already on screen", () => {
    expect(resourceNavigationAction("/resources/usage", "usage")).toBe("none");
    expect(resourceNavigationAction("/", "environments")).toBe("none");
  });

  it("navigates to home from anywhere", () => {
    expect(resourceNavigationAction("/resources/deployments", "environments")).toBe("navigate");
  });

  it("pushes from a sheet or modal path, which has no resource", () => {
    expect(resourceNavigationAction("/account", "deployments")).toBe("push");
  });
});

describe("coveredRoute", () => {
  it("finds the route under a sheet, descending Expo Router's root wrapper", () => {
    expect(coveredResourceId(root([overview, deployments, sheet]))).toBe("deployments");
    expect(coveredRoute(root([overview, sheet]))?.name).toBe("index");
    expect(coveredResourceId(root([overview, sheet]))).toBe("environments");
    expect(coveredResourceId(root([overview, deployments, connect]))).toBe("deployments");
  });

  it("descends into a covered navigator's active route", () => {
    const nested = { name: "group", state: { index: 1, routes: [overview, deployments] } };
    expect(coveredResourceId(root([nested, sheet]))).toBe("deployments");
  });

  it("is null without a sheet on top, without state, or without a covered route", () => {
    expect(coveredRoute(root([overview, deployments]))).toBeNull();
    expect(coveredRoute(undefined)).toBeNull();
    expect(coveredRoute({ routes: [] })).toBeNull();
    expect(coveredRoute(root([sheet]))).toBeNull();
  });
});

describe("routeResourceId", () => {
  it("reads the resource param from a resource route and maps home to environments", () => {
    expect(routeResourceId(deployments)).toBe("deployments");
    expect(routeResourceId({ name: "resources/[resource]/index" })).toBeNull();
    expect(routeResourceId(overview)).toBe("environments");
    expect(routeResourceId({ name: "usage" })).toBeNull();
    expect(routeResourceId({ name: "account" })).toBeNull();
  });
});
