// tests/links.test.ts
import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync, existsSync, statSync } from "fs";
import { join, dirname, resolve, extname } from "path";

/**
 * Recursively get all markdown files in a directory
 */
function getAllMarkdownFiles(dir: string): string[] {
  const files: string[] = [];

  if (!existsSync(dir)) return files;

  const items = readdirSync(dir);

  for (const item of items) {
    const fullPath = join(dir, item);
    if (statSync(fullPath).isDirectory()) {
      files.push(...getAllMarkdownFiles(fullPath));
    } else if (item.endsWith(".md") || item.endsWith(".mdx")) {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * Extract all markdown links from content
 * Matches [text](link) format
 */
function extractMarkdownLinks(
  content: string
): Array<{ text: string; url: string }> {
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const links: Array<{ text: string; url: string }> = [];
  let match;

  while ((match = linkRegex.exec(content)) !== null) {
    links.push({
      text: match[1],
      url: match[2],
    });
  }

  return links;
}

/**
 * Check if a link is internal (not external URL)
 */
function isInternalLink(url: string): boolean {
  // Anchor links are considered internal
  if (url.startsWith("#")) {
    return true;
  }
  // External links start with http://, https://, mailto:, or //
  if (/^(https?:\/\/|mailto:|\/\/)/.test(url)) {
    return false;
  }
  // Relative paths are internal
  return !url.includes("://");
}

/**
 * Resolve internal link to file path
 */
function resolveInternalLink(
  linkUrl: string,
  fromFile: string,
  docsDir: string
): string | null {
  // Handle anchor links (same page)
  if (linkUrl.startsWith("#")) {
    return fromFile;
  }

  // Remove leading slash if present
  const normalizedUrl = linkUrl.startsWith("/") ? linkUrl.slice(1) : linkUrl;

  // Try different possible paths
  const possiblePaths = [
    // Direct path from docs root
    join(docsDir, normalizedUrl),
    // With .md extension
    join(docsDir, normalizedUrl + ".md"),
    // With .mdx extension
    join(docsDir, normalizedUrl + ".mdx"),
    // Relative to current file's directory
    resolve(dirname(fromFile), normalizedUrl),
    resolve(dirname(fromFile), normalizedUrl + ".md"),
    resolve(dirname(fromFile), normalizedUrl + ".mdx"),
    // Index file
    join(docsDir, normalizedUrl, "index.md"),
    join(docsDir, normalizedUrl, "index.mdx"),
  ];

  for (const path of possiblePaths) {
    if (existsSync(path) && statSync(path).isFile()) {
      return path;
    }
    // Check if it's a directory with index file
    if (existsSync(path) && statSync(path).isDirectory()) {
      const indexPath = join(path, "index.md");
      if (existsSync(indexPath)) return indexPath;
      const indexMdxPath = join(path, "index.mdx");
      if (existsSync(indexMdxPath)) return indexMdxPath;
    }
  }

  return null;
}

describe("Internal Links", () => {
  const docsDir = join(process.cwd(), "src/content/docs");

  it("should have no broken internal markdown links", () => {
    const files = getAllMarkdownFiles(docsDir);
    const brokenLinks: Array<{
      file: string;
      link: string;
      url: string;
    }> = [];

    for (const file of files) {
      const content = readFileSync(file, "utf-8");
      const links = extractMarkdownLinks(content);

      for (const link of links) {
        if (isInternalLink(link.url)) {
          const resolvedPath = resolveInternalLink(link.url, file, docsDir);
          if (!resolvedPath || !existsSync(resolvedPath)) {
            brokenLinks.push({
              file,
              link: link.text,
              url: link.url,
            });
          }
        }
      }
    }

    if (brokenLinks.length > 0) {
      const errorMessage = brokenLinks
        .map((bl) => `  - ${bl.file}: [${bl.link}](${bl.url})`)
        .join("\n");
      throw new Error(
        `Found ${brokenLinks.length} broken internal link(s):\n${errorMessage}`
      );
    }

    // Test passes if no broken links found
    expect(brokenLinks.length).toBe(0);
  });

  it("should extract markdown links correctly", () => {
    const content = `
      [External Link](https://example.com)
      [Internal Link](./other-page.md)
      [Anchor Link](#section)
      [Relative Link](../guides/guide.md)
    `;

    const links = extractMarkdownLinks(content);
    expect(links.length).toBe(4);
    expect(links[0].text).toBe("External Link");
    expect(links[0].url).toBe("https://example.com");
    expect(links[1].url).toBe("./other-page.md");
  });

  it("should identify internal vs external links correctly", () => {
    expect(isInternalLink("./page.md")).toBe(true);
    expect(isInternalLink("../guides/guide.md")).toBe(true);
    expect(isInternalLink("#section")).toBe(true);
    expect(isInternalLink("page.md")).toBe(true);

    expect(isInternalLink("https://example.com")).toBe(false);
    expect(isInternalLink("http://example.com")).toBe(false);
    expect(isInternalLink("mailto:test@example.com")).toBe(false);
    expect(isInternalLink("//example.com")).toBe(false);
  });
});
