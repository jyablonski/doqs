import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync, statSync, existsSync } from "fs";
import { join } from "path";
import matter from "gray-matter";

describe("Content Validation", () => {
  const docsDir = join(process.cwd(), "src/content/docs");

  function getAllMdFiles(dir: string): string[] {
    const files: string[] = [];

    if (!existsSync(dir)) return files;

    const items = readdirSync(dir);

    for (const item of items) {
      const fullPath = join(dir, item);
      if (statSync(fullPath).isDirectory()) {
        files.push(...getAllMdFiles(fullPath));
      } else if (item.endsWith(".md") || item.endsWith(".mdx")) {
        files.push(fullPath);
      }
    }

    return files;
  }

  it("should have documentation files", () => {
    const files = getAllMdFiles(docsDir);
    expect(files.length).toBeGreaterThan(0);
  });

  it("should have valid frontmatter in all docs", () => {
    const files = getAllMdFiles(docsDir);

    files.forEach((file) => {
      const content = readFileSync(file, "utf-8");
      const { data } = matter(content);

      expect(data).toBeDefined();
      expect(data.title).toBeDefined();
    });
  });

  it("should have consistent tag format when tags exist", () => {
    const files = getAllMdFiles(docsDir);

    files.forEach((file) => {
      const content = readFileSync(file, "utf-8");
      const { data } = matter(content);

      if (data.tags) {
        expect(Array.isArray(data.tags)).toBe(true);
        data.tags.forEach((tag: unknown) => {
          expect(typeof tag).toBe("string");
        });
      }
    });
  });
});
