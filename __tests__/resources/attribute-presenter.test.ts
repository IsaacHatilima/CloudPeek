import { attributeRows } from "@/features/resources/detail/attribute-presenter";

describe("structured attributes", () => {
  it("groups network settings, formats acronyms, booleans and missing values", () => {
    const rows = attributeRows({ network_settings: {
      cache: { strategy: "default" },
      response_headers: { hsts: { max_age: null, include_subdomains: true } },
      firewall: { bot_categories: [], rate_limit: { "429": false, "4xx": true }, under_attack_mode_started_at: "2026-09-05T23:59:01+05:30" },
      content_converter: false,
    } });
    expect(rows[0]).toMatchObject({ id: "network_settings", label: "Network settings", value: "" });
    expect(rows[0].children?.[1].children?.[0]).toEqual({
      id: "network_settings.response_headers.hsts", label: "HSTS", value: "", children: [
        { id: "network_settings.response_headers.hsts.max_age", label: "Max age", value: "Not set" },
        { id: "network_settings.response_headers.hsts.include_subdomains", label: "Include subdomains", value: "Yes" },
      ],
    });
    expect(rows[0].children?.[2].children).toEqual([
      { id: "network_settings.firewall.bot_categories", label: "Bot categories", value: "None" },
      { id: "network_settings.firewall.rate_limit", label: "Rate limit", value: "", children: [
        { id: "network_settings.firewall.rate_limit.429", label: "HTTP 429 responses", value: "No" },
        { id: "network_settings.firewall.rate_limit.4xx", label: "4xx responses", value: "Yes" },
      ] },
      { id: "network_settings.firewall.under_attack_mode_started_at", label: "Under attack mode started at", value: "5 Sep 2026, 23:59:01" },
    ]);
  });

  it("preserves raw form inputs while displaying structured arrays and masked nested variables", () => {
    const attributes = { settings: { environment_variables: [{ key: "TOKEN", value: "test-secret" }] }, processes: [{ command: "one\ntwo" }], options: {}, flags: [true, false, null] };
    const original = JSON.stringify(attributes);
    const rows = attributeRows(attributes);
    expect(JSON.stringify(rows)).not.toContain("test-secret");
    expect(rows[0].children?.[0]).toMatchObject({ masked: true, value: "TOKEN = ••••••••" });
    expect(rows[1].children?.[0].children?.[0]).toMatchObject({ value: "one\ntwo", multiline: true });
    expect(rows[2].value).toBe("None");
    expect(rows[3].value).toBe("Yes, No, Not set");
    expect(JSON.stringify(attributes)).toBe(original);
  });

  it("shows repository branch and provider links while preserving date-like names", () => {
    expect(attributeRows({ repository: { full_name: "team/project", default_branch: "2026-09-05" }, source_control_provider_type: "gitlab", name: "2026-09-05" })).toContainEqual({
      id: "repository", label: "Repository", value: "team/project", href: "https://gitlab.com/team/project", detail: "Default branch · 2026-09-05",
    });
    expect(attributeRows({ name: "2026-09-05" })[0].value).toBe("2026-09-05");
  });
});
