export type RepositoryDisplay = { name: string; branch?: string; href?: string };
const HOSTS: Record<string, string> = { github: "github.com", gitlab: "gitlab.com", bitbucket: "bitbucket.org" };
const SEGMENT = /^[A-Za-z0-9_.-]+$/;

function repositoryName(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const name = value.trim().replace(/\.git$/, "");
  const parts = name.split("/");
  return parts.length >= 2 && parts.every((part) => SEGMENT.test(part) && part !== "." && part !== "..") ? name : null;
}

/** Only web links without credentials, queries, or fragments are opened. */
function repositoryUrl(value: unknown, provider: string): string | undefined {
  if (typeof value !== "string") return undefined;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.username || url.password || url.search || url.hash || url.port) return undefined;
    if (!Object.values(HOSTS).includes(url.hostname) && provider !== "gitlab_self_hosted") return undefined;
    const name = repositoryName(url.pathname.slice(1).replace(/\/$/, ""));
    return name ? `https://${url.hostname}/${name}` : undefined;
  } catch { return undefined; }
}

/** Cloud's compact repository payload carries full_name and default_branch. */
export function presentRepository(value: unknown, sourceProvider?: unknown): RepositoryDisplay | null {
  const repository = typeof value === "object" && value !== null ? value as Record<string, unknown> : { full_name: value };
  const provider = String(repository.provider ?? repository.source_control_provider_type ?? sourceProvider ?? "github").toLowerCase();
  const explicitUrl = repositoryUrl(repository.html_url ?? repository.web_url ?? repository.url, provider);
  const name = repositoryName(repository.full_name) ?? (explicitUrl ? new URL(explicitUrl).pathname.slice(1) : null);
  if (!name) return null;
  const host = HOSTS[provider];
  const href = explicitUrl ?? (host && (provider !== "github" || name.split("/").length === 2) ? `https://${host}/${name}` : undefined);
  const branch = typeof repository.default_branch === "string" && repository.default_branch ? repository.default_branch : undefined;
  return { name, ...(branch ? { branch } : {}), ...(href ? { href } : {}) };
}
