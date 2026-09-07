import { memoryTokenStorage } from "@/features/connections/token-storage";
import { createTokenVault } from "@/features/connections/token-vault";

describe("token vault", () => {
  it("reads a token through to storage once, then serves it from memory", async () => {
    const storage = memoryTokenStorage();
    storage.entries.set("org_1", "tok_1");
    const read = jest.spyOn(storage, "read");
    const vault = createTokenVault(storage);

    await expect(vault.getToken("org_1")).resolves.toBe("tok_1");
    await expect(vault.getToken("org_1")).resolves.toBe("tok_1");
    expect(read).toHaveBeenCalledTimes(1);
  });

  it("remembers a missing token as missing without re-reading", async () => {
    const storage = memoryTokenStorage();
    const read = jest.spyOn(storage, "read");
    const vault = createTokenVault(storage);

    await expect(vault.getToken("org_1")).resolves.toBeNull();
    await expect(vault.getToken("org_1")).resolves.toBeNull();
    expect(read).toHaveBeenCalledTimes(1);
  });

  it("writes through and forgets on clear", async () => {
    const storage = memoryTokenStorage();
    const vault = createTokenVault(storage);

    await vault.setToken("org_1", "tok_1");
    expect(storage.entries.get("org_1")).toBe("tok_1");
    await expect(vault.getToken("org_1")).resolves.toBe("tok_1");

    await vault.clearToken("org_1");
    expect(storage.entries.has("org_1")).toBe(false);
    await expect(vault.getToken("org_1")).resolves.toBeNull();
  });
});
