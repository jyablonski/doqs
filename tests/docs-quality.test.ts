import { describe, it, expect } from "vitest";
import { existsSync, readdirSync, readFileSync, statSync } from "fs";
import { join } from "path";
import matter from "gray-matter";

function getAllContentFiles(dir: string): string[] {
  const files: string[] = [];

  if (!existsSync(dir)) return files;

  for (const item of readdirSync(dir)) {
    const fullPath = join(dir, item);
    if (statSync(fullPath).isDirectory()) {
      files.push(...getAllContentFiles(fullPath));
    } else if (/\.(md|mdx|astro)$/.test(item)) {
      files.push(fullPath);
    }
  }

  return files;
}

describe("Docs Quality", () => {
  const docsDir = join(process.cwd(), "src/content/docs");
  const files = getAllContentFiles(docsDir);

  it("should not contain known misspellings", () => {
    const misspellings = [
      /\binterractive\b/,
      /\bAcces\b/,
      /\bwatchout\b/,
      /\bmust be ran\b/,
      /\bwill pulls\b/,
      /\bgets ran\b/,
      /\bscheduled to be ran\b/,
      /\bsucess\b/,
      /\bsuccesful\b/,
      /\bdefinately\b/,
      /\boccured\b/,
      /\benviroment\b/,
      /\bprocesss\b/,
    ];

    const matches: string[] = [];

    files.forEach((file) => {
      const content = readFileSync(file, "utf-8");
      misspellings.forEach((misspelling) => {
        if (misspelling.test(content)) {
          matches.push(`${file}: ${misspelling}`);
        }
      });
    });

    expect(matches, matches.join("\n")).toEqual([]);
  });

  it("should not use boilerplate page descriptions", () => {
    const boilerplateDescriptions = new Set([
      "A guide in my new Starlight docs site.",
      "A reference page in my new Starlight docs site.",
    ]);

    const matches: string[] = [];

    files
      .filter((file) => file.endsWith(".md") || file.endsWith(".mdx"))
      .forEach((file) => {
        const { data } = matter(readFileSync(file, "utf-8"));
        if (boilerplateDescriptions.has(data.description)) {
          matches.push(file);
        }
      });

    expect(matches, matches.join("\n")).toEqual([]);
  });

  it("should not ship placeholder example domains outside draft docs", () => {
    const matches: string[] = [];

    files.forEach((file) => {
      const content = readFileSync(file, "utf-8");
      const { data } = matter(content);
      if (data.draft) return;

      if (/https?:\/\/[^"'\s)]*example\.(com|dev)/.test(content)) {
        matches.push(file);
      }
    });

    expect(matches, matches.join("\n")).toEqual([]);
  });
});
