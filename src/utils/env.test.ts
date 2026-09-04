import { describe, expect, it } from "vitest";
import {
  compareEnvKeys,
  isSecretEnvKey,
  parseEnvFile,
  shouldExcludeFromAi,
} from "@/utils/env";

describe("environment parsing", () => {
  it("parses keys and ignores comments", () => {
    const parsed = parseEnvFile("# hi\nDATABASE_URL=postgres://x\nEMPTY=\nBAD LINE\nNEXT_PUBLIC_APP_URL='http://localhost'");
    expect(parsed.DATABASE_URL).toBe("postgres://x");
    expect(parsed.NEXT_PUBLIC_APP_URL).toBe("http://localhost");
    expect(parsed.EMPTY).toBe("");
  });

  it("protects secret-looking keys", () => {
    expect(isSecretEnvKey("NEXTAUTH_SECRET")).toBe(true);
    expect(isSecretEnvKey("NEXT_PUBLIC_APP_URL")).toBe(false);
  });

  it("finds missing and unused variables", () => {
    const result = compareEnvKeys(
      { DATABASE_URL: "", SENTRY_DSN: "" },
      { DATABASE_URL: "x", STRIPE_SECRET: "y" },
    );
    expect(result.missing).toEqual(["SENTRY_DSN"]);
    expect(result.unused).toEqual(["STRIPE_SECRET"]);
  });

  it("excludes credential files from AI context", () => {
    expect(shouldExcludeFromAi(".env.local")).toBe(true);
    expect(shouldExcludeFromAi("id_rsa")).toBe(true);
    expect(shouldExcludeFromAi("package.json")).toBe(false);
  });
});
