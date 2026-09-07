/**
 * Turns a Cloud resource into what a list row shows. Keyed by the JSON:API
 * `type`; anything unknown falls back to the first name-like attribute.
 */
import { formatDateTime, isDateTimeField } from "@/lib/format-date-time";

import type { Tone } from "@/theme/tones";

export type RowTone = Tone;

/** An image when Cloud has one, else initials drawn from `name`. */
export type RowAvatar = { name: string; uri?: string };

export type RowModel = {
  avatar?: RowAvatar;
  id: string;
  /** True when the item is a JSON:API resource with an id of its own, so it can open. */
  openable: boolean;
  status?: string;
  subtitle?: string;
  title: string;
  tone: RowTone;
};

type Attributes = Record<string, unknown>;

/** Attributes of the resources a relationship points at, found in `included`. */
export type Related = (relationship: string) => readonly Attributes[];

/** `included` resources keyed by `type:id`, built once per answer. */
export type IncludedIndex = ReadonlyMap<string, Attributes>;

const NO_RELATED: Related = () => [];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function text(attributes: Attributes, key: string): string | undefined {
  const value = attributes[key];
  if (typeof value !== "string" || value === "") return undefined;
  return isDateTimeField(key) ? formatDateTime(value) : value;
}

function nested(attributes: Attributes, key: string, inner: string): string | undefined {
  const value = attributes[key];
  return isRecord(value) ? text(value, inner) : undefined;
}

function join(...parts: (string | undefined)[]): string | undefined {
  const present = parts.filter((part): part is string => Boolean(part));
  return present.length > 0 ? present.join(" · ") : undefined;
}

const POSITIVE = new Set(["active", "available", "healthy", "running", "success", "finished", "succeeded", "verified", "ready"]);
const PENDING = new Set(["building", "creating", "deploying", "pending", "provisioning", "queued", "restoring", "starting", "updating", "upgrading", "moving", "requesting", "verifying"]);
const NEGATIVE = new Set(["deleted", "deleting", "disabled", "error", "failed", "restore_failed", "stopped", "unknown", "inactive", "maintenance"]);

/**
 * Cloud sometimes reports a status as a dotted event name
 * (`deployment.succeeded`); the last segment is the status itself.
 */
export function displayStatus(status: string | undefined): string | undefined {
  return status?.split(".").pop() || undefined;
}

export function toneFor(status: string | undefined): RowTone {
  const normalised = displayStatus(status)?.toLowerCase();
  if (!normalised) return "neutral";
  if (/^\d+\/\d+ running$/.test(normalised)) return "pending";
  if (POSITIVE.has(normalised)) return "positive";
  if (PENDING.has(normalised)) return "pending";
  if (NEGATIVE.has(normalised)) return "negative";
  return "neutral";
}

type Presenter = (
  attributes: Attributes,
  related: Related,
) => Omit<RowModel, "id" | "openable" | "tone">;

/**
 * One line and one status for a set of environments: all running, none
 * running (the first state stands for them), or a mix.
 */
export function environmentSummary(
  statuses: readonly (string | undefined)[],
): { count: string; status?: string } | undefined {
  const total = statuses.length;
  if (total === 0) return undefined;

  const running = statuses.filter((status) => status === "running").length;
  const count = `${total} environment${total === 1 ? "" : "s"}`;
  if (running === total) return { count, status: "running" };
  if (running === 0) return { count, status: statuses[0] };
  return { count, status: `${running}/${total} running` };
}

const PRESENTERS: Record<string, Presenter> = {
  applications: (a, related) => {
    const summary = environmentSummary(
      related("environments").map((environment) => text(environment, "status")),
    );
    const title = text(a, "name") ?? "Application";
    return {
      avatar: { name: title, uri: text(a, "avatar_url") },
      status: summary?.status,
      subtitle: join(text(a, "region"), nested(a, "repository", "full_name"), summary?.count),
      title,
    };
  },
  backgroundProcesses: (a) => ({
    status: text(a, "status"),
    subtitle: join(text(a, "type"), text(a, "strategy_type")),
    title: text(a, "command") ?? "Background process",
  }),
  background_processes: (a, related) => PRESENTERS.backgroundProcesses(a, related),
  caches: (a) => ({
    status: text(a, "status"),
    subtitle: join(text(a, "type"), text(a, "region"), text(a, "size")),
    title: text(a, "name") ?? "Cache",
  }),
  clusters: (a) => ({
    status: text(a, "status"),
    subtitle: join(text(a, "type"), text(a, "region"), text(a, "tenancy_type")),
    title: text(a, "name") ?? "Cluster",
  }),
  commands: (a) => ({
    status: text(a, "status"),
    subtitle: join(text(a, "started_at"), text(a, "failure_reason")),
    title: text(a, "command") ?? "Command",
  }),
  databaseSchemas: (a) => ({
    status: text(a, "status"),
    subtitle: text(a, "created_at"),
    title: text(a, "name") ?? "Database",
  }),
  database_snapshots: (a) => ({
    status: text(a, "status"),
    subtitle: join(text(a, "type"), text(a, "created_at")),
    title: text(a, "name") ?? text(a, "description") ?? "Snapshot",
  }),
  databases: (a) => ({
    status: text(a, "status"),
    subtitle: join(text(a, "type"), text(a, "region")),
    title: text(a, "name") ?? "Database cluster",
  }),
  deployments: (a) => ({
    status: text(a, "status"),
    subtitle: join(text(a, "branch_name"), text(a, "commit_hash")?.slice(0, 7), text(a, "commit_author")),
    title: text(a, "commit_message") ?? text(a, "commit_hash") ?? "Deployment",
  }),
  domains: (a) => ({
    status: text(a, "hostname_status"),
    subtitle: join(text(a, "type"), text(a, "ssl_status") && `ssl ${text(a, "ssl_status")}`),
    title: text(a, "name") ?? "Domain",
  }),
  edge_networks: (a) => ({
    status: text(a, "status"),
    subtitle: join(text(a, "domain"), text(a, "tenancy_type")),
    title: text(a, "name") ?? "Edge network",
  }),
  environments: (a) => ({
    status: text(a, "status"),
    subtitle: join(text(a, "vanity_domain"), text(a, "php_major_version") && `PHP ${text(a, "php_major_version")}`),
    title: text(a, "name") ?? "Environment",
  }),
  filesystemKeys: (a) => ({
    subtitle: join(text(a, "permission"), text(a, "access_key_id")),
    title: text(a, "name") ?? "Bucket key",
  }),
  filesystems: (a) => ({
    status: text(a, "status"),
    subtitle: join(text(a, "visibility"), text(a, "jurisdiction"), text(a, "type")),
    title: text(a, "name") ?? "Bucket",
  }),
  instances: (a) => ({
    status: text(a, "queue_status"),
    subtitle: join(text(a, "type"), text(a, "size"), text(a, "scaling_type")),
    title: text(a, "name") ?? "Instance",
  }),
  organizations: (a) => ({ subtitle: text(a, "slug"), title: text(a, "name") ?? "Organization" }),
  secrets: (a) => ({ subtitle: text(a, "notes") ?? text(a, "updated_at"), title: text(a, "key") ?? "Secret" }),
  websocketApplications: (a) => ({
    subtitle: text(a, "app_id"),
    title: text(a, "name") ?? "WebSocket application",
  }),
  websocketServers: (a) => ({
    status: text(a, "status"),
    subtitle: join(text(a, "type"), text(a, "region"), text(a, "hostname")),
    title: text(a, "name") ?? "WebSocket cluster",
  }),
};

const NAME_KEYS = ["name", "key", "label", "title", "message", "hostname", "command", "region"];
const DETAIL_KEYS = ["status", "level", "type", "region"];
const DATE_KEYS = ["logged_at", "timestamp", "created_at", "updated_at"];

function fallback(attributes: Attributes): Omit<RowModel, "id" | "openable" | "tone"> {
  const titleKey = NAME_KEYS.find((key) => text(attributes, key));
  const detailKey = DETAIL_KEYS.find((key) => key !== titleKey && text(attributes, key));
  const dateKey = DATE_KEYS.find((key) => text(attributes, key));
  return {
    status: text(attributes, "status"),
    subtitle: join(detailKey ? text(attributes, detailKey) : undefined, dateKey ? text(attributes, dateKey) : undefined),
    title: titleKey ? (text(attributes, titleKey) as string) : "Item",
  };
}

export function indexIncluded(included: readonly unknown[]): IncludedIndex {
  const entries = included.flatMap((resource): [string, Attributes][] => {
    if (!isRecord(resource) || typeof resource.type !== "string" || typeof resource.id !== "string") {
      return [];
    }
    return [[`${resource.type}:${resource.id}`, isRecord(resource.attributes) ? resource.attributes : {}]];
  });
  return new Map(entries);
}

function relatedFrom(item: Record<string, unknown>, index: IncludedIndex): Related {
  const relationships = isRecord(item.relationships) ? item.relationships : {};

  return (relationship) => {
    const link = relationships[relationship];
    const data = isRecord(link) ? link.data : undefined;
    const identifiers = Array.isArray(data) ? data : data ? [data] : [];

    return identifiers.flatMap((identifier) => {
      if (!isRecord(identifier)) return [];
      const found = index.get(`${String(identifier.type)}:${String(identifier.id)}`);
      return found ? [found] : [];
    });
  };
}

/** Rows for a whole answer: its `data` (array or single), with `included` resolved. */
export function presentRows(
  answer: { data: unknown; included?: readonly unknown[] } | undefined,
): RowModel[] {
  if (!answer) return [];
  const items = Array.isArray(answer.data) ? answer.data : [answer.data];
  const index = indexIncluded(answer.included ?? []);
  return items.map((item, position) => presentResource(item, position, index));
}

/** A row for one entry of a `data` array: a JSON:API resource or a plain object. */
export function presentResource(
  item: unknown,
  index: number,
  included: IncludedIndex = new Map(),
): RowModel {
  if (!isRecord(item)) return { id: String(index), openable: false, title: "Item", tone: "neutral" };

  const type = typeof item.type === "string" ? item.type : undefined;
  const attributes = isRecord(item.attributes) ? item.attributes : item;
  const presenter = type ? PRESENTERS[type] : undefined;
  const related = included.size > 0 ? relatedFrom(item, included) : NO_RELATED;
  const row = presenter ? presenter(attributes, related) : fallback(attributes);
  const openable = typeof item.id === "string" && type !== undefined;
  const id = typeof item.id === "string" ? item.id : `${type ?? "item"}-${index}`;

  return { id, ...row, openable, status: displayStatus(row.status), tone: toneFor(row.status) };
}
