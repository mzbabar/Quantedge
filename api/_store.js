// Tiny client for an Upstash Redis database (free tier), called over its REST API.
// Vercel → Project → Storage → Create Database → "Upstash for Redis" → Connect to this project.
// Vercel then adds the connection settings as environment variables. Their names depend on the
// prefix chosen when connecting (KV_REST_API_URL, UPSTASH_KV_REST_API_URL, STORAGE_KV_REST_API_URL,
// UPSTASH_REDIS_REST_URL, ...), so we accept any prefix.
function findEnv(suffixes) {
  for (const s of suffixes) if (process.env[s]) return process.env[s];
  const keys = Object.keys(process.env);
  for (const s of suffixes) {
    const k = keys.find((name) => name.endsWith("_" + s) && process.env[name]);
    if (k) return process.env[k];
  }
  return "";
}

export function connection() {
  const url = findEnv(["KV_REST_API_URL", "UPSTASH_REDIS_REST_URL", "REDIS_REST_API_URL"]);
  // Never pick the read-only token: the counter has to write.
  const token = findEnv(["KV_REST_API_TOKEN", "UPSTASH_REDIS_REST_TOKEN", "REDIS_REST_API_TOKEN"]);
  return url && token ? { url, token } : null;
}

// Names (never values) of database-related settings, to help diagnose setup on the admin page.
export function storageEnvNames() {
  return Object.keys(process.env).filter((k) => /KV|REDIS|UPSTASH/i.test(k)).sort();
}

export function store() {
  const c = connection();
  if (!c) return null;
  return async function pipeline(commands) {
    const r = await fetch(c.url.replace(/\/$/, "") + "/pipeline", {
      method: "POST",
      headers: { Authorization: `Bearer ${c.token}`, "Content-Type": "application/json" },
      body: JSON.stringify(commands),
    });
    if (!r.ok) throw new Error(`store ${r.status}`);
    return (await r.json()).map((x) => x.result);
  };
}

// Calendar day in New York time, e.g. "2026-11-05".
export function day(d = new Date()) {
  return d.toLocaleDateString("en-CA", { timeZone: "America/New_York" });
}
