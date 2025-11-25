import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, existsSync, Dirent } from "fs";
import { join } from "path";

// Helper function to recursively get all markdown files
function getAllMarkdownFiles(dir: string): string[] {
  let files: string[] = [];
  const items = readdirSync(dir, { withFileTypes: true });

  for (const item of items) {
    const fullPath = join(dir, item.name);
    if (item.isDirectory()) {
      files = files.concat(getAllMarkdownFiles(fullPath));
    } else if (item.name.endsWith(".md") || item.name.endsWith(".mdx")) {
      files.push(fullPath);
    }
  }

  return files;
}

describe("Documentation Content", () => {
  it("should have an index page", () => {
    const indexPath = join(process.cwd(), "src/content/docs/index.mdx");
    expect(existsSync(indexPath)).toBe(true);
  });

  it("should have all expected documentation directories", () => {
    const docsPath = join(process.cwd(), "src/content/docs");
    const dirs = readdirSync(docsPath, { withFileTypes: true })
      .filter((dirent: Dirent) => dirent.isDirectory())
      .map((dirent: Dirent) => dirent.name);

    expect(dirs).toContain("architecture");
    expect(dirs).toContain("data");
    expect(dirs).toContain("guides");
    expect(dirs).toContain("runbooks");
    expect(dirs).toContain("services");
  });

  it("should not have empty markdown files", () => {
    const docsPath = join(process.cwd(), "src/content/docs");
    const files = getAllMarkdownFiles(docsPath);

    files.forEach((file: string) => {
      const content = readFileSync(file, "utf-8");
      expect(content.trim().length).toBeGreaterThan(0);
    });
  });

  it("should have valid frontmatter in markdown files", () => {
    const docsPath = join(process.cwd(), "src/content/docs");
    const files = getAllMarkdownFiles(docsPath);

    files.forEach((file: string) => {
      const content = readFileSync(file, "utf-8");
      // Check if file starts with frontmatter (---)
      if (content.trim().startsWith("---")) {
        const frontmatterEnd = content.indexOf("---", 3);
        expect(frontmatterEnd).toBeGreaterThan(3);
      }
    });
  });
});

describe("Astro Configuration", () => {
  it("should have a valid astro config file", () => {
    const configPath = join(process.cwd(), "astro.config.mjs");
    expect(existsSync(configPath)).toBe(true);

    const config = readFileSync(configPath, "utf-8");
    expect(config).toContain("defineConfig");
    expect(config).toContain("starlight");
  });

  it("should have required sidebar sections in config", () => {
    const configPath = join(process.cwd(), "astro.config.mjs");
    const config = readFileSync(configPath, "utf-8");

    expect(config).toContain("Architecture");
    expect(config).toContain("Data Sources");
    expect(config).toContain("Guides");
    expect(config).toContain("Runbooks");
    expect(config).toContain("Services");
  });
});
