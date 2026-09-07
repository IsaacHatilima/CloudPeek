import {
  connectOrganization,
  ConnectOrganizationError,
  organizationRefFrom,
} from "@/features/connections/connect-organization";
import { memoryTokenStorage } from "@/features/connections/token-storage";
import { createTokenVault } from "@/features/connections/token-vault";
import { CloudApiError } from "@/services/cloud-api/client";

const organizationBody = {
  data: { attributes: { name: "Landeni", slug: "landeni" }, id: "org_1", type: "organizations" },
};

function deps(answer: () => Promise<unknown>) {
  const storage = memoryTokenStorage();
  const register = jest.fn();
  const createApi = jest.fn(() => ({
    client: { GET: jest.fn(async () => ({ data: await answer() })) } as never,
  }));

  return { createApi, register, storage, vault: createTokenVault(storage) };
}

describe("connectOrganization", () => {
  it("resolves the token to its organization, stores it, and registers the organization", async () => {
    const d = deps(async () => organizationBody);

    await expect(connectOrganization("  tok_1  ", d)).resolves.toEqual({
      id: "org_1",
      name: "Landeni",
      slug: "landeni",
    });
    expect(d.createApi).toHaveBeenCalledWith({ token: "tok_1" });
    expect(d.storage.entries.get("org_1")).toBe("tok_1");
    expect(d.register).toHaveBeenCalledWith({ id: "org_1", name: "Landeni", slug: "landeni" });
  });

  it("refuses an empty token before touching the network", async () => {
    const d = deps(async () => organizationBody);

    await expect(connectOrganization("   ", d)).rejects.toThrow("Paste an API token first.");
    expect(d.createApi).not.toHaveBeenCalled();
  });

  it("explains a rejected token in plain words", async () => {
    const d = deps(async () => {
      throw new CloudApiError(401, "Unauthenticated.");
    });

    const failure = connectOrganization("tok_bad", d);

    await expect(failure).rejects.toBeInstanceOf(ConnectOrganizationError);
    await expect(failure).rejects.toThrow(/rejected the token/);
    expect(d.storage.entries.size).toBe(0);
    expect(d.register).not.toHaveBeenCalled();
  });

  it("refuses an answer that is not an organization", async () => {
    const d = deps(async () => ({ data: { id: "x", type: "users" } }));

    await expect(connectOrganization("tok_1", d)).rejects.toThrow(/not with an organization/);
    expect(d.storage.entries.size).toBe(0);
  });
});

describe("organizationRefFrom", () => {
  it("accepts the documented shape and rejects everything else", () => {
    expect(organizationRefFrom(organizationBody)).toEqual({ id: "org_1", name: "Landeni", slug: "landeni" });
    expect(organizationRefFrom({ data: { attributes: { name: "X" }, id: "o" } })).toEqual({ id: "o", name: "X", slug: undefined });
    expect(organizationRefFrom({ data: { attributes: {}, id: "o" } })).toBeNull();
    expect(organizationRefFrom(null)).toBeNull();
  });
});
