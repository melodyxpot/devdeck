const WINDOWS_DRIVE = /^[a-zA-Z]:[\\/]/;
const UNC = /^\\\\/;

export function isAbsolutePath(value: string): boolean {
  return value.startsWith("/") || WINDOWS_DRIVE.test(value) || UNC.test(value);
}

export function normalizePath(value: string): string {
  return value.replace(/\\/g, "/").replace(/\/+$/, "");
}

export function hasPathTraversal(value: string): boolean {
  const parts = normalizePath(value).split("/");
  return parts.includes("..");
}

export function isSafeUserPath(value: string): boolean {
  if (!value || value.length > 4096) return false;
  if (value.includes("\0")) return false;
  if (hasPathTraversal(value)) return false;
  if (!isAbsolutePath(value)) return false;
  return true;
}

export function basename(value: string): string {
  const normalized = normalizePath(value);
  const parts = normalized.split("/");
  return parts[parts.length - 1] || normalized;
}

export function detectPackageManager(files: string[]): "npm" | "pnpm" | "yarn" | "bun" | "unknown" {
  if (files.includes("pnpm-lock.yaml")) return "pnpm";
  if (files.includes("bun.lockb") || files.includes("bun.lock")) return "bun";
  if (files.includes("yarn.lock")) return "yarn";
  if (files.includes("package-lock.json") || files.includes("package.json")) return "npm";
  return "unknown";
}

export function detectFramework(files: string[], pkgName?: string): {
  framework:
    | "nextjs"
    | "react"
    | "node"
    | "python"
    | "django"
    | "laravel"
    | "rust"
    | "go"
    | "docker"
    | "git"
    | "unknown";
  runtime: "node" | "python" | "rust" | "go" | "php" | "docker" | "unknown";
} {
  if (files.includes("next.config.js") || files.includes("next.config.mjs") || files.includes("next.config.ts")) {
    return { framework: "nextjs", runtime: "node" };
  }
  if (files.includes("manage.py")) return { framework: "django", runtime: "python" };
  if (files.includes("artisan")) return { framework: "laravel", runtime: "php" };
  if (files.includes("Cargo.toml")) return { framework: "rust", runtime: "rust" };
  if (files.includes("go.mod")) return { framework: "go", runtime: "go" };
  if (files.includes("docker-compose.yml") || files.includes("compose.yaml")) {
    return { framework: "docker", runtime: "docker" };
  }
  if (files.includes("package.json")) {
    if (pkgName === "react") return { framework: "react", runtime: "node" };
    return { framework: "node", runtime: "node" };
  }
  if (files.includes("requirements.txt") || files.includes("pyproject.toml")) {
    return { framework: "python", runtime: "python" };
  }
  if (files.includes(".git")) return { framework: "git", runtime: "unknown" };
  return { framework: "unknown", runtime: "unknown" };
}
