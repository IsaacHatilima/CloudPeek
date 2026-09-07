import { breadcrumbModel, organizationInitial } from "@/features/scope/breadcrumb-model";
import type { WorkspaceSelection } from "@/features/workspace/types";

const acme = { id: "org_1", name: "Acme" };
const shop = { id: "app_1", name: "Shop" };
const production = { id: "env_1", name: "production", status: "stopped" };

const nothing: WorkspaceSelection = { application: null, environment: null, organization: null };

describe("breadcrumbModel", () => {
  it("prompts to connect when nothing is connected", () => {
    const model = breadcrumbModel(nothing);

    expect(model.opens).toBe("connect");
    expect(model.segments).toEqual([{ kind: "prompt", label: "Connect an organization", level: "organization" }]);
  });

  it("shows the organization initial and prompts for the next level", () => {
    const model = breadcrumbModel({ ...nothing, organization: acme });

    expect(model.opens).toBe("application");
    expect(model.segments).toEqual([
      { initial: "A", kind: "avatar", level: "organization", name: "Acme" },
      { kind: "prompt", label: "Choose an application", level: "application" },
    ]);
  });

  it("reads the whole path with the environment's freshest status", () => {
    const model = breadcrumbModel(
      { application: shop, environment: production, organization: acme },
      [{ ...production, status: "running" }],
    );

    expect(model.opens).toBe("environment");
    expect(model.segments.at(-1)).toEqual({ kind: "value", label: "production", level: "environment", status: "running" });
    expect(model.accessibilityLabel).toBe("Scope: Acme, Shop, production (running)");
  });

  it("falls back to the status stored with the selection", () => {
    const model = breadcrumbModel({ application: shop, environment: production, organization: acme });

    expect(model.segments.at(-1)).toMatchObject({ status: "stopped" });
  });

  it("derives a safe initial", () => {
    expect(organizationInitial("  landeni")).toBe("L");
    expect(organizationInitial("")).toBe("?");
  });
});
