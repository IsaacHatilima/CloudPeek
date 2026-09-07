/**
 * Rows for the Usage and Billing screens, read from Cloud's `/usage` report.
 * The report is `data` (summary, resources, addons, application_totals,
 * environment_usage, private_cloud) plus `meta` (currency, period,
 * last_updated_at). Everything is read defensively: a missing section means a
 * missing row, never a crash.
 */
import { formatDateTime } from "@/lib/format-date-time";

export type KeyValueRow = { id: string; label: string; value: string };

type Attributes = Record<string, unknown>;

function isRecord(value: unknown): value is Attributes {
  return typeof value === "object" && value !== null;
}

function section(report: unknown, ...path: string[]): Attributes | null {
  return path.reduce<Attributes | null>((current, key) => {
    const next = current?.[key];
    return isRecord(next) ? next : null;
  }, isRecord(report) ? report : null);
}

function number(source: Attributes | null, key: string): number | null {
  const value = source?.[key];
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function text(source: Attributes | null, key: string): string | null {
  const value = source?.[key];
  return typeof value === "string" && value !== "" ? value : null;
}

export function formatMoney(cents: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", { currency, style: "currency" }).format(cents / 100);
}

const BYTE_UNITS = ["B", "KB", "MB", "GB", "TB", "PB"];

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), BYTE_UNITS.length - 1);
  const value = bytes / 1024 ** exponent;
  return `${value >= 100 ? Math.round(value) : value.toFixed(1)} ${BYTE_UNITS[exponent]}`;
}

function describePeriod(period: number | null): string {
  if (period === null || period === 0) return "Current billing period";
  return period === 1 ? "Previous billing period" : `${period} billing periods ago`;
}

/** What the Billing tab shows: spend, credits, the alert, bandwidth, freshness. */
export function billingRows(report: unknown): readonly KeyValueRow[] {
  const meta = section(report, "meta");
  const currency = text(meta, "currency") ?? "USD";
  const summary = section(report, "data", "summary");
  const credits = section(summary, "credits");
  const alert = section(summary, "alert");
  const bandwidth = section(summary, "bandwidth");
  const spend = number(summary, "current_spend_cents");
  const rows: KeyValueRow[] = [];

  if (spend !== null) {
    rows.push({ id: "spend", label: describePeriod(number(meta, "period")), value: formatMoney(spend, currency) });
  }
  const used = number(credits, "used_cents");
  const total = number(credits, "total_cents");
  if (used !== null && total !== null) {
    rows.push({ id: "credits", label: "Credits used", value: `${formatMoney(used, currency)} of ${formatMoney(total, currency)}` });
  }
  const threshold = number(alert, "threshold_cents");
  const remaining = number(alert, "remaining_percentage");
  if (threshold !== null) {
    const suffix = remaining !== null ? ` · ${remaining}% remaining` : "";
    rows.push({ id: "alert", label: "Spending alert", value: `${formatMoney(threshold, currency)}${suffix}` });
  }
  const bandwidthCost = number(bandwidth, "cost_cents");
  const bandwidthUsage = number(bandwidth, "usage_percentage");
  const allowance = number(bandwidth, "allowance_bytes");
  if (bandwidthCost !== null) {
    const detail = bandwidthUsage !== null && allowance !== null ? ` · ${bandwidthUsage}% of ${formatBytes(allowance)}` : "";
    rows.push({ id: "bandwidth", label: "Bandwidth", value: `${formatMoney(bandwidthCost, currency)}${detail}` });
  }
  const updated = text(meta, "last_updated_at");
  if (updated) rows.push({ id: "updated", label: "Last updated", value: formatDateTime(updated) });

  return rows;
}

/** What the Usage tab shows: where the spend comes from. */
export function usageRows(report: unknown): readonly KeyValueRow[] {
  const meta = section(report, "meta");
  const currency = text(meta, "currency") ?? "USD";
  const data = section(report, "data");
  const rows: KeyValueRow[] = [];

  const resources = number(section(data, "resources"), "total_cost_cents");
  if (resources !== null) rows.push({ id: "resources", label: "Resources", value: formatMoney(resources, currency) });

  const addons = number(section(data, "addons"), "total_cost_cents");
  if (addons !== null) rows.push({ id: "addons", label: "Add-ons", value: formatMoney(addons, currency) });

  const applications = section(data, "application_totals");
  const applicationCost = number(applications, "total_cost_cents");
  const applicationCount = number(applications, "application_count");
  if (applicationCost !== null) {
    const count = applicationCount !== null ? `${applicationCount} application${applicationCount === 1 ? "" : "s"} · ` : "";
    rows.push({ id: "applications", label: "Applications", value: `${count}${formatMoney(applicationCost, currency)}` });
  }

  const environments = number(section(data, "environment_usage"), "total_cost_cents");
  if (environments !== null) rows.push({ id: "environments", label: "Environment usage", value: formatMoney(environments, currency) });

  const privateCloud = number(section(data, "private_cloud"), "total_cost_cents");
  if (privateCloud !== null) rows.push({ id: "private-cloud", label: "Private cloud", value: formatMoney(privateCloud, currency) });

  const period = number(meta, "period");
  if (rows.length > 0) rows.push({ id: "period", label: "Period", value: describePeriod(period) });

  return rows;
}
