import type { TokenStorage } from "./token-storage";

/**
 * Tokens for the connected organizations, read through once and then served
 * from memory so every request does not hit the keychain.
 */
export type TokenVault = {
  clearToken(organizationId: string): Promise<void>;
  getToken(organizationId: string): Promise<string | null>;
  setToken(organizationId: string, token: string): Promise<void>;
};

export function createTokenVault(storage: TokenStorage): TokenVault {
  const cache = new Map<string, string | null>();

  return {
    async clearToken(organizationId) {
      await storage.remove(organizationId);
      cache.delete(organizationId);
    },
    async getToken(organizationId) {
      const cached = cache.get(organizationId);
      if (cached !== undefined) return cached;

      const token = await storage.read(organizationId);
      cache.set(organizationId, token);
      return token;
    },
    async setToken(organizationId, token) {
      await storage.write(organizationId, token);
      cache.set(organizationId, token);
    },
  };
}
