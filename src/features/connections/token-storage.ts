/** Where an organization's API token lives. Keyed by organization id. */
export type TokenStorage = {
  read(organizationId: string): Promise<string | null>;
  remove(organizationId: string): Promise<void>;
  write(organizationId: string, token: string): Promise<void>;
};

/** For tests and previews: tokens live only as long as the process. */
export function memoryTokenStorage(): TokenStorage & { entries: Map<string, string> } {
  const entries = new Map<string, string>();

  return {
    entries,
    read: async (organizationId) => entries.get(organizationId) ?? null,
    remove: async (organizationId) => {
      entries.delete(organizationId);
    },
    write: async (organizationId, token) => {
      entries.set(organizationId, token);
    },
  };
}
