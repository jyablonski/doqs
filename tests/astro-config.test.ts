import { describe, it, expect } from "vitest";
import { existsSync } from "fs";
import { join } from "path";

describe("Astro Configuration", () => {
  it("should have astro config file", () => {
    const configPath = join(process.cwd(), "astro.config.mjs");
    expect(existsSync(configPath)).toBe(true);
  });

  it("should be able to import astro config", async () => {
    const config = await import("../astro.config.mjs");
    expect(config.default).toBeDefined();
  });
});
