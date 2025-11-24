import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

describe("Footer Component", () => {
  const footerContent = readFileSync(
    join(process.cwd(), "src/components/Footer.astro"),
    "utf-8"
  );

  it("should contain environment links", () => {
    expect(footerContent).toContain("dev.example.dev");
    expect(footerContent).toContain("test.example.dev");
    expect(footerContent).toContain("prod.example.dev");
  });

  it('should have proper target="_blank" for external links', () => {
    const targetBlankMatches = footerContent.match(/target=\{"_blank"\}/g);
    expect(targetBlankMatches).toBeTruthy();
  });

  it("should include Starlight components", () => {
    expect(footerContent).toContain("EditLink");
    expect(footerContent).toContain("LastUpdated");
    expect(footerContent).toContain("Pagination");
  });

  it("should have both Label 1 and Label 2 tabs", () => {
    expect(footerContent).toContain("Label 1");
    expect(footerContent).toContain("Label 2");
  });
});
