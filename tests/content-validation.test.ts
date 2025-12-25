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

  it("should have required metadata fields (author, lastUpdated, tags) in all docs", () => {
    // Files exempt from metadata requirements
    const exemptFiles = [
      "404.md", // Error page
      "example.mdx", // Draft/template file
    ];

    const files = getAllMdFiles(docsDir);

    files.forEach((file) => {
      const fileName = file.split("/").pop() || "";

      // Skip exempt files
      if (exemptFiles.includes(fileName)) {
        return;
      }

      const content = readFileSync(file, "utf-8");
      const { data } = matter(content);
      const relativePath = file.replace(docsDir + "/", "");

      // Check for author field
      expect(
        data.author,
        `Missing 'author' field in ${relativePath}`
      ).toBeDefined();
      expect(
        typeof data.author,
        `'author' should be a string in ${relativePath}`
      ).toBe("string");

      // Check for lastUpdated field
      expect(
        data.lastUpdated,
        `Missing 'lastUpdated' field in ${relativePath}`
      ).toBeDefined();

      // Check for tags field
      expect(
        data.tags,
        `Missing 'tags' field in ${relativePath}`
      ).toBeDefined();
      expect(
        Array.isArray(data.tags),
        `'tags' should be an array in ${relativePath}`
      ).toBe(true);
      expect(
        data.tags.length,
        `'tags' should not be empty in ${relativePath}`
      ).toBeGreaterThan(0);
    });
  });
});
