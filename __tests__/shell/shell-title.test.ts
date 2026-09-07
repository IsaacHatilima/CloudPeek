import { shellTitle } from "@/features/shell/shell-title";

const overview = { name: "index" };
const deployments = {
  name: "resources/[resource]/index",
  params: { resource: "deployments" },
};
const sheet = { name: "scope", params: { level: "organization" } };

function root(routes: readonly { name: string; params?: object; state?: object }[]) {
  return { routes: [{ name: "__root", state: { routes } }] } as never;
}

describe("shellTitle", () => {
  it("names the home screen after the environments list it shows", () => {
    expect(shellTitle("/", undefined)).toBe("Environments");
  });

  it("names the pushed resource, falling back for an unknown id", () => {
    expect(shellTitle("/resources/deployments", undefined)).toBe("Deployments");
    expect(shellTitle("/resources/usage", undefined)).toBe("Usage");
    expect(shellTitle("/resources/billing", undefined)).toBe("Billing");
    expect(shellTitle("/resources/nope", undefined)).toBe("Overview");
  });

  it("keeps the covered screen's title while a sheet is open", () => {
    expect(shellTitle("/scope", root([overview, deployments, sheet]))).toBe("Deployments");
    expect(shellTitle("/scope", root([overview, sheet]))).toBe("Environments");
    expect(shellTitle("/connect", root([overview, deployments, { name: "connect" }]))).toBe("Deployments");
  });

  it("falls back to Overview when the navigation state is not ready or the route is unknown", () => {
    expect(shellTitle("/scope", undefined)).toBe("Overview");
    expect(shellTitle("/account", undefined)).toBe("Overview");
    expect(shellTitle("/scope", root([{ name: "account" }, sheet]))).toBe("Overview");
  });
});
