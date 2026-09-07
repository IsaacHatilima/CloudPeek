import {
  activeResourceId,
  childListPath,
  coveredResourceId,
  detailPath,
  isDetailPath,
  isSheetPath,
  resourceNavigationAction,
  routeResourceId,
} from "@/features/shell/resource-navigation";
import { shellTitle } from "@/features/shell/shell-title";

describe("detail and child-list paths", () => {
  it("builds item and parent-scoped list paths with encoding", () => {
    expect(detailPath("applications", "app 1")).toBe("/resources/applications/app%201");
    expect(detailPath("databases", "db", "cluster/1")).toBe("/resources/databases/db?parent=cluster%2F1");
    expect(childListPath("bucket-keys", "bkt_1")).toBe("/resources/bucket-keys?parent=bkt_1");
  });

  it("recognises an item path as its resource", () => {
    expect(activeResourceId("/resources/applications/app_1")).toBe("applications");
    expect(isDetailPath("/resources/applications/app_1")).toBe(true);
    expect(isDetailPath("/resources/applications")).toBe(false);
    expect(activeResourceId("/resources/applications/app_1/extra")).toBeNull();
  });

  it("navigates back to the list from one of its items, and replaces from an item to another resource", () => {
    expect(resourceNavigationAction("/resources/applications/app_1", "applications")).toBe("navigate");
    expect(resourceNavigationAction("/resources/applications", "applications")).toBe("none");
    expect(resourceNavigationAction("/resources/applications/app_1", "caches")).toBe("replace");
    expect(resourceNavigationAction("/resources/environments/env_1", "environments")).toBe("navigate");
  });

  it("treats the action sheet like the other sheets and reads nested route names", () => {
    expect(isSheetPath("/action")).toBe(true);
    expect(routeResourceId({ name: "resources/[resource]/[id]", params: { id: "x", resource: "domains" } })).toBe("domains");
    expect(routeResourceId({ name: "resources/[resource]/index", params: { resource: "caches" } })).toBe("caches");

    const state = {
      index: 0,
      routes: [
        {
          name: "__root",
          state: {
            index: 2,
            routes: [
              { name: "index" },
              { name: "resources/[resource]/[id]", params: { id: "app_1", resource: "applications" } },
              { name: "action", params: { operationId: "public.applications.update" } },
            ],
          },
        },
      ],
    };
    expect(coveredResourceId(state)).toBe("applications");
    expect(shellTitle("/action", state)).toBe("Applications");
    expect(shellTitle("/resources/applications/app_1", undefined)).toBe("Applications");
  });
});
