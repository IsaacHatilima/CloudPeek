import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement } from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";

import { useCloudConnection } from "@/features/connections/use-cloud-api";
import { tokenVault } from "@/features/connections/secure-token-storage";

jest.mock("@/features/workspace/use-workspace", () => ({ useWorkspaceSelection: () => ({ organization: { id: "org-1" } }) }));
jest.mock("@/features/connections/secure-token-storage", () => ({ tokenVault: { getToken: jest.fn() } }));
jest.mock("@/services/cloud-api/client", () => ({ createCloudApi: ({ token }: { token: string }) => ({ token }) }));

describe("loading credentials from secure storage", () => {
  it("stays in the loading state until secure storage resolves, then exposes the API", async () => {
    let resolve!: (value: string | null) => void;
    jest.mocked(tokenVault.getToken).mockReturnValue(new Promise((done) => { resolve = done; }));
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    let result!: ReturnType<typeof useCloudConnection>;
    function Probe() { result = useCloudConnection(); return null; }
    let tree!: ReactTestRenderer;
    await act(async () => { tree = create(createElement(QueryClientProvider, { client }, createElement(Probe))); });
    expect(result).toEqual({ api: null, isLoading: true });
    await act(async () => { resolve("stored-token"); await new Promise((done) => setTimeout(done, 20)); });
    expect(result.isLoading).toBe(false);
    expect(result.api).toEqual({ token: "stored-token" });
    await act(async () => { tree.unmount(); });
    client.clear();
  });
});
