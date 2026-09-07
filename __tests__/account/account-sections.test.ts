import {
  accountSections,
  CLOUD_API_DOCS_URL,
} from "@/features/account/account-sections";

const acme = { id: "org_1", name: "Acme", slug: "acme" };

describe("accountSections", () => {
  it("explains organization-based token access", () => {
    const [account] = accountSections({ organizations: [], version: "0.1.0" });

    expect(account?.title).toBe("Device access");
    expect(account?.items[0]?.label).toBe("Private by default");
    expect(account?.items[0]?.detail).toMatch(/API token/);
  });

  it("lists connected organizations, or says there are none", () => {
    const none = accountSections({ organizations: [], version: "0.1.0" })[1];
    const some = accountSections({ organizations: [acme], version: "0.1.0" })[1];

    expect(none?.items.map((item) => item.label)).toEqual(["None connected yet"]);
    expect(some?.items).toEqual([{ detail: "acme", id: "org_1", label: "Acme" }]);
  });

  it("shows the version and links to the Cloud API docs", () => {
    const about = accountSections({ organizations: [], version: "0.1.0" })[2];

    expect(about?.items).toEqual([
      { detail: "0.1.0", id: "version", label: "Version" },
      expect.objectContaining({ href: CLOUD_API_DOCS_URL, id: "docs" }),
    ]);
  });
});
