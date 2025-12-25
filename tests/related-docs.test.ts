import { describe, it, expect } from "vitest";
import { readFileSync, existsSync, readdirSync } from "fs";
import { join } from "path";
import matter from "gray-matter";

describe("RelatedDocs Component", () => {
  const componentPath = join(process.cwd(), "src/components/RelatedDocs.astro");

  describe("Component Structure", () => {
    it("should exist", () => {
      expect(existsSync(componentPath)).toBe(true);
    });

    it("should have required HTML elements", () => {
      const content = readFileSync(componentPath, "utf-8");
      expect(content).toContain("related-docs");
      expect(content).toContain("related-heading");
      expect(content).toContain("Related Pages");
      expect(content).toContain("related-card");
      expect(content).toContain("related-tag");
    });

    it("should import getCollection from astro:content", () => {
      const content = readFileSync(componentPath, "utf-8");
      expect(content).toContain(
        'import { getCollection } from "astro:content"'
      );
    });

    it("should define excluded pages", () => {
      const content = readFileSync(componentPath, "utf-8");
      expect(content).toContain("excludedPages");
      expect(content).toContain('"404"');
      expect(content).toContain('"index"');
    });

    it("should filter out draft pages", () => {
      const content = readFileSync(componentPath, "utf-8");
      expect(content).toContain("doc.data.draft");
    });

    it("should limit results to 3 related docs", () => {
      const content = readFileSync(componentPath, "utf-8");
      expect(content).toContain(".slice(0, 3)");
    });

    it("should sort by score descending", () => {
      const content = readFileSync(componentPath, "utf-8");
      expect(content).toContain("b.score - a.score");
    });
  });

  describe("Tag Scoring Logic", () => {
    // Extract and test the scoring logic independently
    function calculateSharedTags(
      currentTags: string[],
      docTags: string[]
    ): string[] {
      return currentTags.filter((tag) => docTags.includes(tag));
    }

    function scoreDoc(currentTags: string[], docTags: string[]): number {
      return calculateSharedTags(currentTags, docTags).length;
    }

    it("should return 0 for no shared tags", () => {
      const score = scoreDoc(["python", "aws"], ["terraform", "database"]);
      expect(score).toBe(0);
    });

    it("should return 1 for one shared tag", () => {
      const score = scoreDoc(["python", "aws"], ["python", "database"]);
      expect(score).toBe(1);
    });

    it("should return correct count for multiple shared tags", () => {
      const score = scoreDoc(
        ["python", "aws", "elt"],
        ["python", "aws", "database"]
      );
      expect(score).toBe(2);
    });

    it("should return all tags when fully matching", () => {
      const score = scoreDoc(["python", "aws"], ["python", "aws"]);
      expect(score).toBe(2);
    });

    it("should identify correct shared tags", () => {
      const shared = calculateSharedTags(
        ["service", "python", "elt"],
        ["service", "database", "elt"]
      );
      expect(shared).toContain("service");
      expect(shared).toContain("elt");
      expect(shared).not.toContain("python");
      expect(shared).not.toContain("database");
    });

    it("should handle empty current tags", () => {
      const score = scoreDoc([], ["python", "aws"]);
      expect(score).toBe(0);
    });

    it("should handle empty doc tags", () => {
      const score = scoreDoc(["python", "aws"], []);
      expect(score).toBe(0);
    });
  });

  describe("Astro Config Integration", () => {
    it("should be registered as Pagination component override", () => {
      const configPath = join(process.cwd(), "astro.config.mjs");
      const config = readFileSync(configPath, "utf-8");
      expect(config).toContain("Pagination:");
      expect(config).toContain("RelatedDocs.astro");
    });
  });
});

describe("Related Docs in Built Output", () => {
  const distDir = join(process.cwd(), "dist");
  const distExists = existsSync(distDir);

  // Helper to get all HTML files recursively
  function getAllHtmlFiles(dir: string): string[] {
    const files: string[] = [];
    if (!existsSync(dir)) return files;

    const items = readdirSync(dir, { withFileTypes: true });
    for (const item of items) {
      const fullPath = join(dir, item.name);
      if (item.isDirectory()) {
        files.push(...getAllHtmlFiles(fullPath));
      } else if (item.name.endsWith(".html")) {
        files.push(fullPath);
      }
    }
    return files;
  }

  it.skipIf(!distExists)(
    "should include related-docs section in pages with tags",
    () => {
      const htmlFiles = getAllHtmlFiles(distDir);

      // Find a page that should have related docs (e.g., dbt which has shared tags)
      const dbtPage = htmlFiles.find((f) => f.includes("/dbt/index.html"));
      if (dbtPage) {
        const content = readFileSync(dbtPage, "utf-8");
        // dbt page has tags, so it should have related docs
        expect(content).toContain("related-docs");
        expect(content).toContain("Related Pages");
      }
    }
  );

  it.skipIf(!distExists)("should not include related-docs on 404 page", () => {
    const notFoundPage = join(distDir, "404.html");
    if (existsSync(notFoundPage)) {
      const content = readFileSync(notFoundPage, "utf-8");
      expect(content).not.toContain("related-docs");
    }
  });

  it.skipIf(!distExists)(
    "should have related-card links with proper href format",
    () => {
      const htmlFiles = getAllHtmlFiles(distDir);

      // Check any page with related docs
      for (const file of htmlFiles) {
        const content = readFileSync(file, "utf-8");
        if (content.includes("related-docs")) {
          // Verify links have related-card class and proper href (order may vary)
          expect(content).toContain("related-card");
          expect(content).toMatch(/href="\/[^"]+\/"/);
          break;
        }
      }
    }
  );
});

describe("Tag Coverage for Related Docs", () => {
  const docsDir = join(process.cwd(), "src/content/docs");

  function getAllMdFiles(dir: string): string[] {
    const files: string[] = [];
    if (!existsSync(dir)) return files;

    const items = readdirSync(dir, { withFileTypes: true });
    for (const item of items) {
      const fullPath = join(dir, item.name);
      if (item.isDirectory()) {
        files.push(...getAllMdFiles(fullPath));
      } else if (item.name.endsWith(".md") || item.name.endsWith(".mdx")) {
        files.push(fullPath);
      }
    }
    return files;
  }

  it("should have enough tag overlap for related docs to work", () => {
    const files = getAllMdFiles(docsDir);
    const tagMap = new Map<string, number>();

    // Count tag usage across all docs
    files.forEach((file) => {
      const content = readFileSync(file, "utf-8");
      const { data } = matter(content);
      const tags: string[] = data.tags || [];

      tags.forEach((tag) => {
        tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
      });
    });

    // At least some tags should be used by multiple docs
    const sharedTags = Array.from(tagMap.entries()).filter(
      ([_, count]) => count >= 2
    );
    expect(sharedTags.length).toBeGreaterThan(0);
  });

  it("should have most pages with potential related docs", () => {
    const files = getAllMdFiles(docsDir);
    const exemptFiles = ["404.md", "example.mdx", "index.mdx"];

    let pagesWithTags = 0;

    files.forEach((file) => {
      const fileName = file.split("/").pop() || "";
      if (exemptFiles.includes(fileName)) return;

      const content = readFileSync(file, "utf-8");
      const { data } = matter(content);

      if (data.tags && data.tags.length > 0) {
        pagesWithTags++;
      }
    });

    // Most non-exempt pages should have tags
    const totalNonExempt = files.filter(
      (f) => !exemptFiles.includes(f.split("/").pop() || "")
    ).length;
    const coverage = pagesWithTags / totalNonExempt;

    expect(coverage).toBeGreaterThanOrEqual(0.9); // 90% coverage
  });
});
