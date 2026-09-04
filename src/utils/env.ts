const SECRET_HINTS = [
  "secret",
  "password",
  "passwd",
  "token",
  "api_key",
  "apikey",
  "private",
  "credential",
  "auth",
  "access_key",
  "client_secret",
];

export const ENV_FILE_NAMES = [
  ".env",
  ".env.local",
  ".env.development",
  ".env.production",
  ".env.example",
] as const;

export function isSecretEnvKey(key: string): boolean {
  const lower = key.toLowerCase();
  return SECRET_HINTS.some((hint) => lower.includes(hint));
}

export function parseEnvFile(contents: string): Record<string, string> {
  const result: Record<string, string> = {};
  for (const rawLine of contents.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) continue;
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    result[key] = value;
  }
  return result;
}

export function compareEnvKeys(
  example: Record<string, string>,
  actual: Record<string, string>,
): { missing: string[]; unused: string[]; shared: string[] } {
  const exampleKeys = Object.keys(example);
  const actualKeys = Object.keys(actual);
  const missing = exampleKeys.filter((key) => !(key in actual)).sort();
  const unused = actualKeys.filter((key) => !(key in example)).sort();
  const shared = exampleKeys.filter((key) => key in actual).sort();
  return { missing, unused, shared };
}

export function shouldExcludeFromAi(filename: string): boolean {
  const name = filename.toLowerCase();
  return (
    name.includes(".env") ||
    name.endsWith(".pem") ||
    name.endsWith(".key") ||
    name.includes("id_rsa") ||
    name.includes("credentials") ||
    name.includes("secret")
  );
}
