const ACRONYMS: Record<string, string> = {
  api: "API", cdn: "CDN", cors: "CORS", cpu: "CPU", dns: "DNS", hsts: "HSTS", http: "HTTP",
  https: "HTTPS", id: "ID", ids: "IDs", ip: "IP", php: "PHP", ssl: "SSL", tcp: "TCP", tls: "TLS", ttl: "TTL", url: "URL", urls: "URLs",
};

export function displayLabel(key: string): string {
  const words = key.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/[_-]/g, " ").split(/\s+/).filter(Boolean);
  return words.map((word, index) => ACRONYMS[word.toLowerCase()] ??
    (index === 0 ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : word.toLowerCase())).join(" ");
}
