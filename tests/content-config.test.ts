import { describe, it, expect } from "vitest";
import { z } from "zod";
import { readFileSync } from "fs";
import { join } from "path";

/**
 * Test the content.config.ts schema logic without importing the actual file
 * (since it uses Astro-specific modules that can't be easily mocked in Vitest)
 */
describe("Content Config Schema", () => {
  // Replicate the schema from content.config.ts for testing
  const extendedSchema = z.object({
    title: z.string(),
    description: z.string().optional(),
    tags: z.array(z.string()).optional(),
    author: z.string().optional(),
  });

  it("should validate documents with all fields", () => {
    const validDoc = {
      title: "Test Page",
      description: "A test description",
      tags: ["test", "example"],
      author: "Test Author",
    };

    expect(() => extendedSchema.parse(validDoc)).not.toThrow();
    const parsed = extendedSchema.parse(validDoc);
    expect(parsed.title).toBe("Test Page");
    expect(parsed.description).toBe("A test description");
    expect(parsed.tags).toEqual(["test", "example"]);
    expect(parsed.author).toBe("Test Author");
  });

  it("should allow documents without optional fields", () => {
    const minimalDoc = {
      title: "Minimal Page",
    };

    expect(() => extendedSchema.parse(minimalDoc)).not.toThrow();
    const parsed = extendedSchema.parse(minimalDoc);
    expect(parsed.title).toBe("Minimal Page");
    expect(parsed.tags).toBeUndefined();
    expect(parsed.author).toBeUndefined();
  });

  it("should validate tags as array of strings", () => {
    // Valid tags
    expect(() =>
      extendedSchema.parse({ title: "Test", tags: ["tag1", "tag2"] })
    ).not.toThrow();

    // Invalid: tags not an array
    expect(() =>
      extendedSchema.parse({ title: "Test", tags: "not-an-array" })
    ).toThrow();

    // Invalid: tags array contains non-strings
    expect(() =>
      extendedSchema.parse({ title: "Test", tags: ["tag1", 123] })
    ).toThrow();
  });

  it("should validate author as string", () => {
    // Valid author
    expect(() =>
      extendedSchema.parse({ title: "Test", author: "John Doe" })
    ).not.toThrow();

    // Invalid: author not a string
    expect(() =>
      extendedSchema.parse({ title: "Test", author: 123 })
    ).toThrow();
  });

  it("should require title field", () => {
    // Missing title should fail
    expect(() => extendedSchema.parse({})).toThrow();
    expect(() => extendedSchema.parse({ description: "Test" })).toThrow();
  });

  it("should match the structure defined in content.config.ts", () => {
    // Verify the config file exists and has the expected structure
    const configPath = join(process.cwd(), "src/content.config.ts");
    const configContent = readFileSync(configPath, "utf-8");

    // Check that it extends docsSchema
    expect(configContent).toContain("docsSchema");
    expect(configContent).toContain("extend");

    // Check that it includes tags and author fields
    expect(configContent).toContain("tags");
    expect(configContent).toContain("author");
    expect(configContent).toContain("z.array(z.string())");
  });
});
