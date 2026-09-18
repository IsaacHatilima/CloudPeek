import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement } from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";

import { useConnectOrganization } from "@/features/connections/use-connect-organization";
import { connectOrganization } from "@/features/connections/connect-organization";

const mockRegister = jest.fn();
const mockDismiss = jest.fn();
jest.mock("expo-router", () => ({ useRouter: () => ({ dismissAll: mockDismiss }) }));
jest.mock("@/features/workspace/workspace-store", () => ({ useWorkspaceStore: (select: (store: unknown) => unknown) => select({ addOrganization: mockRegister }) }));
jest.mock("@/features/connections/connect-organization", () => ({ connectOrganization: jest.fn() }));
jest.mock("@/features/connections/secure-token-storage", () => ({ tokenVault: {} }));

it("replaces a rejected cached token and clears failed resource reads before selecting the organization", async () => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity }, mutations: { gcTime: Infinity } } });
  client.setQueryData(["token", "org-1"], "old-token");
  client.setQueryData(["cloud", "org-1", "applications"], { data: [] });
  jest.mocked(connectOrganization).mockImplementation(async (_token, dependencies) => {
    const organization = { id: "org-1", name: "Example" };
    await dependencies.register(organization);
    return organization;
  });
  mockRegister.mockImplementation(() => {
    expect(client.getQueryData(["token", "org-1"])).toBe("new-token");
    expect(client.getQueryData(["cloud", "org-1", "applications"])).toBeUndefined();
  });
  let result!: ReturnType<typeof useConnectOrganization>;
  function Probe() { result = useConnectOrganization(); return null; }
  let tree!: ReactTestRenderer;
  await act(async () => { tree = create(createElement(QueryClientProvider, { client }, createElement(Probe))); });
  await act(async () => { await result.mutateAsync("  new-token  "); });
  expect(mockRegister).toHaveBeenCalledWith({ id: "org-1", name: "Example" });
  expect(mockDismiss).toHaveBeenCalled();
  await act(async () => { tree.unmount(); });
  client.clear();
});
