import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync, existsSync, statSync } from "fs";
import { join, dirname, resolve } from "path";

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

function stripCodeBlocks(content: string): string {
  return content.replace(/```[\s\S]*?```/g, "");
}

function extractLinks(content: string): Array<{ text: string; url: string }> {
  const links: Array<{ text: string; url: string }> = [];
  const contentWithoutCode = stripCodeBlocks(content);

  for (const match of contentWithoutCode.matchAll(/!?\[([^\]]+)\]\(([^)]+)\)/g)) {
    if (match[0].startsWith("!")) continue;
    links.push({ text: match[1], url: match[2].trim() });
  }

  for (const match of contentWithoutCode.matchAll(/href=["']([^"']+)["']/g)) {
    links.push({ text: "HTML href", url: match[1].trim() });
  }

  return links;
}

function isInternalLink(url: string): boolean {
  if (url.startsWith("#")) return true;
  if (/^(https?:\/\/|mailto:|\/\/)/.test(url)) return false;
  return !url.includes("://");
}

function splitPathAndAnchor(url: string): { path: string; anchor?: string } {
  const [pathWithQuery, anchor] = url.split("#", 2);
  const [path] = pathWithQuery.split("?", 1);
  return { path, anchor };
}

function normalizeDocPath(linkUrl: string): string {
  const { path } = splitPathAndAnchor(linkUrl);
  return path.startsWith("/") ? path.slice(1) : path;
}

function resolveInternalLink(
  linkUrl: string,
  fromFile: string,
  docsDir: string
): string | null {
  if (linkUrl.startsWith("#")) return fromFile;

  const normalizedUrl = normalizeDocPath(linkUrl).replace(/\/$/, "");

  const possiblePaths = [
    join(docsDir, normalizedUrl),
    join(docsDir, `${normalizedUrl}.md`),
    join(docsDir, `${normalizedUrl}.mdx`),
    resolve(dirname(fromFile), normalizedUrl),
    resolve(dirname(fromFile), `${normalizedUrl}.md`),
    resolve(dirname(fromFile), `${normalizedUrl}.mdx`),
    join(docsDir, normalizedUrl, "index.md"),
    join(docsDir, normalizedUrl, "index.mdx"),
  ];

  for (const path of possiblePaths) {
    if (existsSync(path) && statSync(path).isFile()) return path;
    if (existsSync(path) && statSync(path).isDirectory()) {
      const indexPath = join(path, "index.md");
      if (existsSync(indexPath)) return indexPath;
      const indexMdxPath = join(path, "index.mdx");
      if (existsSync(indexMdxPath)) return indexMdxPath;
    }
  }

  return null;
}

function slugifyHeading(heading: string): string {
  return heading
    .replace(/[`*_~[\]()]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function getHeadingAnchors(file: string): Set<string> {
  const content = stripCodeBlocks(readFileSync(file, "utf-8"));
  const anchors = new Set<string>();

  for (const match of content.matchAll(/^#{1,6}\s+(.+)$/gm)) {
    anchors.add(slugifyHeading(match[1]));
  }

  return anchors;
}

describe("Links", () => {
  const docsDir = join(process.cwd(), "src/content/docs");

  it("should have no broken internal Markdown or HTML links", () => {
    const files = getAllMarkdownFiles(docsDir);
    const brokenLinks: Array<{ file: string; link: string; url: string }> = [];

    for (const file of files) {
      const content = readFileSync(file, "utf-8");

      for (const link of extractLinks(content)) {
        if (!isInternalLink(link.url)) continue;

        const resolvedPath = resolveInternalLink(link.url, file, docsDir);
        if (!resolvedPath || !existsSync(resolvedPath)) {
          brokenLinks.push({ file, link: link.text, url: link.url });
          continue;
        }

        const { anchor } = splitPathAndAnchor(link.url);
        if (anchor && !getHeadingAnchors(resolvedPath).has(anchor)) {
          brokenLinks.push({ file, link: link.text, url: link.url });
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

    expect(brokenLinks.length).toBe(0);
  });

  it("should extract Markdown and HTML links correctly", () => {
    const content = `
      [External Link](https://example.com)
      [Internal Link](./other-page.md)
      ![Image](./image.png)
      <a href="/guides/data_ingestion/">Data ingestion</a>
    `;

    const links = extractLinks(content);
    expect(links).toEqual([
      { text: "External Link", url: "https://example.com" },
      { text: "Internal Link", url: "./other-page.md" },
      { text: "HTML href", url: "/guides/data_ingestion/" },
    ]);
  });

  it("should identify internal vs external links correctly", () => {
    expect(isInternalLink("./page.md")).toBe(true);
    expect(isInternalLink("../guides/guide.md")).toBe(true);
    expect(isInternalLink("#section")).toBe(true);
    expect(isInternalLink("page.md")).toBe(true);
    expect(isInternalLink("/guides/data_ingestion/")).toBe(true);

    expect(isInternalLink("https://example.com")).toBe(false);
    expect(isInternalLink("http://example.com")).toBe(false);
    expect(isInternalLink("mailto:test@example.com")).toBe(false);
    expect(isInternalLink("//example.com")).toBe(false);
  });
});
