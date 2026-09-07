import { findResource } from "@/features/cloud-resources/catalog";
import {
  menuItemState,
  NO_LIST_ENDPOINT_CAPTION,
} from "@/features/shell/menu-item-state";
import type { WorkspaceSelection } from "@/features/workspace/types";

const acme = { id: "org_1", name: "Acme" };
const shop = { id: "app_1", name: "Shop" };
const production = { id: "env_1", name: "Production" };

const nothing: WorkspaceSelection = {
  application: null,
  environment: null,
  organization: null,
};
const orgOnly: WorkspaceSelection = { ...nothing, organization: acme };
const full: WorkspaceSelection = {
  application: shop,
  environment: production,
  organization: acme,
};

function item(id: string) {
  const found = findResource(id);
  if (!found) throw new Error(`no catalog item ${id}`);
  return found;
}

describe("menuItemState", () => {
  it("dims every row, without a caption, while no organization is selected", () => {
    expect(menuItemState(item("applications"), nothing)).toEqual({
      caption: undefined,
      dimmed: true,
    });
  });

  it("enables an organization-scoped row once an organization is selected", () => {
    expect(menuItemState(item("applications"), orgOnly)).toEqual({
      dimmed: false,
    });
  });

  it("names the next thing to select for deeper scopes", () => {
    expect(menuItemState(item("deployments"), orgOnly)).toEqual({
      caption: "Select an application",
      dimmed: true,
    });
  });

  it("says when Cloud has no list endpoint instead of asking for a scope", () => {
    expect(menuItemState(item("database-restores"), full)).toEqual({
      caption: NO_LIST_ENDPOINT_CAPTION,
      dimmed: true,
    });
  });

  it("asks for a parent on cluster- and bucket-scoped rows even with the chain selected", () => {
    expect(menuItemState(item("bucket-keys"), full)).toEqual({
      caption: "Choose a bucket",
      dimmed: true,
    });
  });
});
