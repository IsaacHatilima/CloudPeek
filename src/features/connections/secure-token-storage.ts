/**
 * The real token storage: the device keychain / keystore via expo-secure-store.
 * Tokens are secrets, so they never go through the document-directory adapter
 * the workspace selection uses. `AFTER_FIRST_UNLOCK` keeps them readable for a
 * background refresh once the device has been unlocked since boot.
 */
import * as SecureStore from "expo-secure-store";

import type { TokenStorage } from "./token-storage";
import { createTokenVault } from "./token-vault";

const OPTIONS: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK,
};

/** SecureStore keys allow only letters, digits, `.`, `-`, `_`. */
function keyFor(organizationId: string): string {
  return `cloudpeek.token.${organizationId.replace(/[^A-Za-z0-9._-]/g, "_")}`;
}

export const secureTokenStorage: TokenStorage = {
  read: (organizationId) => SecureStore.getItemAsync(keyFor(organizationId), OPTIONS),
  remove: (organizationId) => SecureStore.deleteItemAsync(keyFor(organizationId), OPTIONS),
  write: (organizationId, token) =>
    SecureStore.setItemAsync(keyFor(organizationId), token, OPTIONS),
};

export const tokenVault = createTokenVault(secureTokenStorage);
