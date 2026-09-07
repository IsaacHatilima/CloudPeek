import {
  billingRows,
  formatBytes,
  formatMoney,
  usageRows,
} from "@/features/usage/usage-presenters";

const report = {
  data: {
    addons: { items: [], total_cost_cents: 500 },
    application_totals: { application_count: 2, applications: [], total_cost_cents: 39900 },
    environment_usage: null,
    private_cloud: null,
    resources: { buckets: [], caches: [], databases: [], total_cost_cents: 1300, websockets: [] },
    summary: {
      alert: { remaining_percentage: 40, threshold_cents: 70000 },
      bandwidth: { allowance_bytes: 107374182400, cost_cents: 0, usage_percentage: 12 },
      credits: { total_cents: 10000, used_cents: 2500 },
      current_spend_cents: 41200,
    },
  },
  meta: { available_periods: [], currency: "USD", last_updated_at: "2026-09-05T10:00:00Z", period: 0 },
};

describe("formatting", () => {
  it("formats cents as currency and bytes as the nearest unit", () => {
    expect(formatMoney(41200)).toBe("$412.00");
    expect(formatMoney(5, "EUR")).toBe("€0.05");
    expect(formatBytes(512)).toBe("512 B");
    expect(formatBytes(107374182400)).toBe("100 GB");
    expect(formatBytes(1536)).toBe("1.5 KB");
  });
});

describe("billingRows", () => {
  it("reads spend, credits, the alert, bandwidth, and freshness from the summary", () => {
    expect(billingRows(report)).toEqual([
      { id: "spend", label: "Current billing period", value: "$412.00" },
      { id: "credits", label: "Credits used", value: "$25.00 of $100.00" },
      { id: "alert", label: "Spending alert", value: "$700.00 · 40% remaining" },
      { id: "bandwidth", label: "Bandwidth", value: "$0.00 · 12% of 100 GB" },
      { id: "updated", label: "Last updated", value: "5 Sep 2026, 10:00:00" },
    ]);
  });

  it("drops rows whose section is missing instead of failing", () => {
    expect(billingRows({ data: { summary: { current_spend_cents: 100 } } })).toEqual([
      { id: "spend", label: "Current billing period", value: "$1.00" },
    ]);
    expect(billingRows(null)).toEqual([]);
  });
});

describe("usageRows", () => {
  it("breaks the spend down and names the period", () => {
    expect(usageRows(report)).toEqual([
      { id: "resources", label: "Resources", value: "$13.00" },
      { id: "addons", label: "Add-ons", value: "$5.00" },
      { id: "applications", label: "Applications", value: "2 applications · $399.00" },
      { id: "period", label: "Period", value: "Current billing period" },
    ]);
  });

  it("describes earlier periods", () => {
    expect(usageRows({ ...report, meta: { ...report.meta, period: 1 } }).at(-1)?.value).toBe(
      "Previous billing period",
    );
    expect(usageRows({})).toEqual([]);
  });
});
