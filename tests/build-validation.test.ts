import { describe, it, expect } from "vitest";
import { existsSync, readdirSync, readFileSync, statSync } from "fs";
import { join, relative } from "path";
import matter from "gray-matter";

function getAllMarkdownFiles(dir: string): string[] {
  const files: string[] = [];

  if (!existsSync(dir)) return files;

  for (const item of readdirSync(dir)) {
    const fullPath = join(dir, item);
    if (statSync(fullPath).isDirectory()) {
      files.push(...getAllMarkdownFiles(fullPath));
    } else if (item.endsWith(".md") || item.endsWith(".mdx")) {
      files.push(fullPath);
    }
  }

  return files;
}

function docFileToOutputPage(file: string, docsDir: string): string {
  const docPath = relative(docsDir, file).replace(/\.(md|mdx)$/, "");

  if (docPath === "index") return "index.html";
  if (docPath === "404") return "404.html";

  return join(docPath, "index.html");
}

describe("Build Validation", () => {
  const projectRoot = process.cwd();
  const docsDir = join(projectRoot, "src/content/docs");
  const distDir = join(projectRoot, "dist");

  it("should have built project output", () => {
    expect(
      existsSync(distDir),
      "Run `npm run build` before running build output validation."
    ).toBe(true);
    expect(readdirSync(distDir, { recursive: false }).length).toBeGreaterThan(0);
  });

  it("should create dist directory", () => {
    expect(existsSync(distDir)).toBe(true);
    expect(statSync(distDir).isDirectory()).toBe(true);
  });

  it("should generate expected build output files", () => {
    expect(existsSync(distDir)).toBe(true);

    const distContents = readdirSync(distDir, {
      recursive: false,
      encoding: "utf8",
    }) as string[];

    expect(distContents.length).toBeGreaterThan(0);

    // Check for common Astro output patterns
    const hasIndexHtml = distContents.some((item: string) => {
      const fullPath = join(distDir, item);
      return (
        statSync(fullPath).isFile() &&
        (item === "index.html" || item.endsWith(".html"))
      );
    });

    const hasAssetsDir = distContents.some((item: string) => {
      const fullPath = join(distDir, item);
      return statSync(fullPath).isDirectory() && item === "_astro";
    });

    expect(hasIndexHtml).toBe(true);
    expect(hasAssetsDir).toBe(true);
  });

  it("should include static assets from public directory", () => {
    const publicDir = join(projectRoot, "public");

    if (existsSync(publicDir)) {
      const publicFiles = readdirSync(publicDir).filter((file) =>
        statSync(join(publicDir, file)).isFile()
      );

      publicFiles.forEach((file) => {
        expect(existsSync(join(distDir, file))).toBe(true);
      });
    }
  });

  it("should include generated pages for every non-draft doc", () => {
    const expectedPages = getAllMarkdownFiles(docsDir)
      .filter((file) => !matter(readFileSync(file, "utf-8")).data.draft)
      .map((file) => docFileToOutputPage(file, docsDir));

    expectedPages.forEach((page) => {
      expect(existsSync(join(distDir, page)), `Missing ${page}`).toBe(true);
    });
  });
});
