function normalizeOrigin(value) {
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

export function configuredOrigins(env = process.env) {
  const values = [env.WEB_ORIGIN, ...(env.ALLOWED_ORIGINS || "").split(",")].filter(Boolean);
  if (!env.WEB_ORIGIN && env.NODE_ENV !== "production") values.push("http://localhost:5173");
  return new Set(values.map(normalizeOrigin).filter(Boolean));
}

export function isAllowedOrigin(origin, env = process.env) {
  const normalized = normalizeOrigin(origin);
  if (!normalized) return false;
  if (configuredOrigins(env).has(normalized)) return true;

  if (env.NODE_ENV === "production") return false;
  try {
    const url = new URL(normalized);
    return (
      url.protocol === "http:" &&
      ["localhost", "127.0.0.1"].includes(url.hostname) &&
      ["5173", "5174", "5175", "5176"].includes(url.port)
    );
  } catch {
    return false;
  }
}
