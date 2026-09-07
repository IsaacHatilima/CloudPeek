import { createNavigationSession, NAVIGATION_STORAGE_KEY } from "@/features/shell/navigation-persistence";
import type { WorkspaceSelection } from "@/features/workspace/types";

const selection: WorkspaceSelection = {
  organization: { id: "org-1", name: "Acme" },
  application: { id: "app-1", name: "Shop" },
  environment: { id: "env-1", name: "Production" },
};

function memoryStorage() {
  const entries = new Map<string, string>();
  return {
    entries,
    getItem: (key: string) => entries.get(key) ?? null,
    setItem: (key: string, value: string) => { entries.set(key, value); },
  };
}

describe("navigation relaunch", () => {
  it("restores the last screen and parent after a new session, then remembers Back to home", () => {
    const storage = memoryStorage();
    const location = { pathname: "/resources/databases/db-1", parent: "cluster / 1", selection };
    createNavigationSession(storage).observe(location);
    const reopened = createNavigationSession(storage);
    expect(reopened.observe({ pathname: "/", selection })).toBe(
      "/resources/databases/db-1?parent=cluster%20%2F%201",
    );
    // A second home render during restoration must not overwrite the destination.
    reopened.observe({ pathname: "/", selection });
    expect(reopened.observe(location)).toBeNull();
    reopened.observe({ pathname: "/", selection });
    expect(createNavigationSession(storage).observe({ pathname: "/", selection })).toBeNull();
  });

  it.each(["/scope", "/connect", "/action", "/account"])("does not remember transient screen %s", (pathname) => {
    const storage = memoryStorage();
    const session = createNavigationSession(storage);
    session.observe({ pathname: "/resources/deployments", selection });
    session.observe({ pathname, selection });
    expect(createNavigationSession(storage).observe({ pathname: "/", selection })).toBe("/resources/deployments");
  });

  it("lets incoming links take precedence and never resets on a later home visit", () => {
    const storage = memoryStorage();
    createNavigationSession(storage).observe({ pathname: "/resources/deployments", selection });
    const session = createNavigationSession(storage);
    expect(session.observe({ pathname: "/resources/applications/app-2", selection })).toBeNull();
    expect(session.observe({ pathname: "/", selection })).toBeNull();
  });

  it("does not restore resource IDs from a different workspace scope", () => {
    const storage = memoryStorage();
    createNavigationSession(storage).observe({ pathname: "/resources/deployments/deploy-1", selection });
    const switched = { ...selection, environment: { id: "env-2", name: "Staging" } };
    expect(createNavigationSession(storage).observe({ pathname: "/", selection: switched })).toBeNull();
  });

  it("writes only scope IDs and the resource's parent parameter", () => {
    const storage = memoryStorage();
    const session = createNavigationSession(storage);
    session.observe({ pathname: "/resources/applications", selection });
    expect(JSON.parse(storage.entries.get(NAVIGATION_STORAGE_KEY)!)).toEqual({
      href: "/resources/applications", scope: '["org-1","app-1","env-1"]',
    });
    session.observe({ pathname: "/resources/not-a-resource", selection });
    expect(createNavigationSession(storage).observe({ pathname: "/", selection })).toBe("/resources/applications");
  });

  it.each(["null", "{}", '{"href":"/action","scope":"x"}', '{"href":"/resources/applications?token=secret","scope":"x"}'])(
    "ignores invalid saved state %s", (raw) => {
      const storage = memoryStorage();
      storage.entries.set(NAVIGATION_STORAGE_KEY, raw);
      expect(createNavigationSession(storage).observe({ pathname: "/", selection })).toBeNull();
    },
  );

  it("survives storage read and write failures", () => {
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
    const session = createNavigationSession({
      getItem: () => { throw new Error("unavailable"); },
      setItem: () => { throw new Error("unavailable"); },
    });
    expect(session.observe({ pathname: "/", selection })).toBeNull();
    expect(warn).toHaveBeenCalledTimes(2);
    warn.mockRestore();
  });
});
