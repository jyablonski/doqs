import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

describe("Footer Component", () => {
  const footerContent: string = readFileSync(
    join(process.cwd(), "src/components/Footer.astro"),
    "utf-8"
  );

  it("should contain environment links", () => {
    expect(footerContent).toContain("nbadashboard.jyablonski.dev");
    expect(footerContent).toContain("api.jyablonski.dev");
    expect(footerContent).toContain("doqs.jyablonski.dev");
    expect(footerContent).not.toContain("example.dev");
    expect(footerContent).not.toContain("example.com");
  });

  it('should have proper target="_blank" for external links', () => {
    const targetBlankMatches: RegExpMatchArray | null =
      footerContent.match(/target=\{"_blank"\}/g);
    expect(targetBlankMatches).toBeTruthy();
  });

  it("should include Starlight components", () => {
    expect(footerContent).toContain("EditLink");
    expect(footerContent).toContain("LastUpdated");
    expect(footerContent).toContain("Pagination");
  });

  it("should have app and repository tabs", () => {
    expect(footerContent).toContain('label="Apps"');
    expect(footerContent).toContain('label="Repos"');
  });
});
