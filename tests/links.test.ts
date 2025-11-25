// tests/links.test.ts
import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync, existsSync } from "fs";
import { join } from "path";

describe("Internal Links", () => {
  it("should have no broken internal markdown links", () => {
    const docsDir = join(process.cwd(), "src/content/docs");
    // Add logic to parse markdown links and verify targets exist
  });
});
