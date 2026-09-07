import type { StateStorage } from "zustand/middleware";

import {
  createWorkspaceStore,
  isPersistedWorkspace,
  persistedWorkspace,
  WORKSPACE_STORAGE_KEY,
} from "@/features/workspace/workspace-store";

function memoryStorage(): StateStorage & { entries: Map<string, string> } {
  const entries = new Map<string, string>();

  return {
    entries,
    getItem: (name) => entries.get(name) ?? null,
    removeItem: (name) => {
      entries.delete(name);
    },
    setItem: (name, value) => {
      entries.set(name, value);
    },
  };
}

const acme = { id: "org_1", name: "Acme", slug: "acme" };
const globex = { id: "org_2", name: "Globex", slug: "globex" };
const shop = { id: "app_1", name: "Shop" };
const production = { id: "env_1", name: "Production" };
const staging = { id: "env_2", name: "Staging" };

function storeWithEverythingSelected() {
  const store = createWorkspaceStore(memoryStorage());
  const actions = store.getState();

  actions.setOrganizations([acme, globex]);
  actions.selectOrganization(acme);
  actions.setApplications([shop]);
  actions.selectApplication(shop);
  actions.setEnvironments([production, staging]);
  actions.selectEnvironment(production);

  return store;
}

describe("workspace store", () => {
  it("starts empty", () => {
    const { applications, environments, organizations, selection } =
      createWorkspaceStore(memoryStorage()).getState();

    expect(organizations).toEqual([]);
    expect(applications).toEqual([]);
    expect(environments).toEqual([]);
    expect(selection).toEqual({
      application: null,
      environment: null,
      organization: null,
    });
  });

  it("switching organization resets the application, the environment, and both catalogs", () => {
    const store = storeWithEverythingSelected();

    store.getState().selectOrganization(globex);

    expect(store.getState().selection).toEqual({
      application: null,
      environment: null,
      organization: globex,
    });
    expect(store.getState().applications).toEqual([]);
    expect(store.getState().environments).toEqual([]);
  });

  it("re-selecting the current organization keeps everything", () => {
    const store = storeWithEverythingSelected();

    store.getState().selectOrganization({ ...acme });

    expect(store.getState().selection.application).toEqual(shop);
    expect(store.getState().selection.environment).toEqual(production);
    expect(store.getState().environments).toEqual([production, staging]);
  });

  it("switching application resets only the environment", () => {
    const store = storeWithEverythingSelected();
    const blog = { id: "app_2", name: "Blog" };

    store.getState().setApplications([shop, blog]);
    store.getState().selectApplication(blog);

    expect(store.getState().selection.organization).toEqual(acme);
    expect(store.getState().selection.application).toEqual(blog);
    expect(store.getState().selection.environment).toBeNull();
    expect(store.getState().environments).toEqual([]);
  });

  it("switching environment changes nothing else", () => {
    const store = storeWithEverythingSelected();

    store.getState().selectEnvironment(staging);

    expect(store.getState().selection).toEqual({
      application: shop,
      environment: staging,
      organization: acme,
    });
  });

  it("drops the selection when its organization is no longer connected", () => {
    const store = storeWithEverythingSelected();

    store.getState().setOrganizations([globex]);

    expect(store.getState().organizations).toEqual([globex]);
    expect(store.getState().selection).toEqual({
      application: null,
      environment: null,
      organization: null,
    });
  });

  it("clears the whole selection on demand", () => {
    const store = storeWithEverythingSelected();

    store.getState().clearSelection();

    expect(store.getState().selection).toEqual({
      application: null,
      environment: null,
      organization: null,
    });
    expect(store.getState().organizations).toEqual([acme, globex]);
  });

  it("persists only the connected organizations and the selection", () => {
    const state = storeWithEverythingSelected().getState();

    expect(persistedWorkspace(state)).toEqual({
      organizations: [acme, globex],
      selection: {
        application: shop,
        environment: production,
        organization: acme,
      },
    });
  });

  it("reopens where the user left off, with fresh catalogs", () => {
    const storage = memoryStorage();
    const first = createWorkspaceStore(storage);
    const actions = first.getState();

    actions.setOrganizations([acme]);
    actions.selectOrganization(acme);
    actions.setApplications([shop]);
    actions.selectApplication(shop);
    actions.setEnvironments([production]);
    actions.selectEnvironment(production);

    expect(storage.entries.has(WORKSPACE_STORAGE_KEY)).toBe(true);

    const reopened = createWorkspaceStore(storage).getState();

    expect(reopened.selection).toEqual({
      application: shop,
      environment: production,
      organization: acme,
    });
    expect(reopened.organizations).toEqual([acme]);
    expect(reopened.applications).toEqual([]);
    expect(reopened.environments).toEqual([]);
  });

  it("never mutates a previous state object", () => {
    const store = createWorkspaceStore(memoryStorage());
    const before = store.getState();
    const selectionBefore = before.selection;

    before.selectOrganization(acme);

    expect(store.getState()).not.toBe(before);
    expect(store.getState().selection).not.toBe(selectionBefore);
    expect(selectionBefore.organization).toBeNull();
  });
});

describe("workspace store: what comes back from disk", () => {
  const stored = (state: unknown) => JSON.stringify({ state, version: 1 });
  let warn: jest.SpyInstance;

  beforeEach(() => {
    warn = jest.spyOn(console, "warn").mockImplementation(() => undefined);
  });

  afterEach(() => {
    warn.mockRestore();
  });

  it("accepts a well-formed stored workspace", () => {
    const storage = memoryStorage();
    storage.entries.set(
      WORKSPACE_STORAGE_KEY,
      stored({
        organizations: [acme],
        selection: { application: null, environment: null, organization: acme },
      }),
    );

    const state = createWorkspaceStore(storage).getState();

    expect(state.organizations).toEqual([acme]);
    expect(state.selection.organization).toEqual(acme);
    expect(warn).not.toHaveBeenCalled();
  });

  it("falls back to defaults and reports a stored workspace with the wrong shape", () => {
    const storage = memoryStorage();
    storage.entries.set(
      WORKSPACE_STORAGE_KEY,
      stored({ organizations: "nope", selection: {} }),
    );

    const state = createWorkspaceStore(storage).getState();

    expect(state.organizations).toEqual([]);
    expect(state.selection).toEqual({
      application: null,
      environment: null,
      organization: null,
    });
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("rehydrate"));
  });

  it("rejects a stored ref that is missing its name", () => {
    const storage = memoryStorage();
    storage.entries.set(
      WORKSPACE_STORAGE_KEY,
      stored({
        organizations: [{ id: "org_1" }],
        selection: { application: null, environment: null, organization: null },
      }),
    );

    expect(createWorkspaceStore(storage).getState().organizations).toEqual([]);
    expect(warn).toHaveBeenCalledTimes(1);
  });

  it("isPersistedWorkspace checks every field it relies on", () => {
    const selection = { application: null, environment: null, organization: null };

    expect(isPersistedWorkspace({ organizations: [], selection })).toBe(true);
    expect(isPersistedWorkspace({ organizations: [acme], selection: { ...selection, organization: acme } })).toBe(true);
    expect(isPersistedWorkspace(null)).toBe(false);
    expect(isPersistedWorkspace({ organizations: [], selection: null })).toBe(false);
    expect(isPersistedWorkspace({ organizations: [], selection: { ...selection, environment: "env_1" } })).toBe(false);
    expect(isPersistedWorkspace({ organizations: {}, selection })).toBe(false);
  });
});

describe("workspace store: connections", () => {
  it("adding an organization selects it and resets what was below", () => {
    const store = storeWithEverythingSelected();

    store.getState().addOrganization({ id: "org_3", name: "Initech" });

    expect(store.getState().organizations.map((o) => o.id)).toEqual(["org_1", "org_2", "org_3"]);
    expect(store.getState().selection).toEqual({
      application: null,
      environment: null,
      organization: { id: "org_3", name: "Initech" },
    });
    expect(store.getState().applications).toEqual([]);
  });

  it("adding a known organization again refreshes it instead of duplicating it", () => {
    const store = storeWithEverythingSelected();

    store.getState().addOrganization({ ...acme, name: "Acme Corp" });

    expect(store.getState().organizations.filter((o) => o.id === "org_1")).toHaveLength(1);
    expect(store.getState().selection.organization?.name).toBe("Acme Corp");
  });

  it("removing the selected organization clears the selection; removing another does not", () => {
    const store = storeWithEverythingSelected();

    store.getState().removeOrganization("org_2");
    expect(store.getState().selection.organization).toEqual(acme);

    store.getState().removeOrganization("org_1");
    expect(store.getState().organizations).toEqual([]);
    expect(store.getState().selection).toEqual({ application: null, environment: null, organization: null });
  });
});
