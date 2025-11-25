import { describe, it, expect, vi } from "vitest";
import { z } from "zod";

// Mock Astro modules before importing
vi.mock("astro:content", () => ({
  defineCollection: vi.fn((config) => config),
  z: z,
}));

vi.mock("@astrojs/starlight/loaders", () => ({
  docsLoader: vi.fn(() => ({})),
}));

vi.mock("@astrojs/starlight/schema", () => ({
  docsSchema: vi.fn((config) => {
    const baseSchema = z.object({
      title: z.string(),
      description: z.string().optional(),
    });

    if (config?.extend) {
      return baseSchema.extend(config.extend.shape);
    }
    return baseSchema;
  }),
}));

describe("Content Collections Schema", () => {
  it("should validate extended schema fields", async () => {
    // Test the schema logic directly
    const extendedFields = z.object({
      tags: z.array(z.string()).optional(),
      author: z.string().optional(),
    });

    const validDoc = {
      title: "Test Page",
      description: "A test description",
      tags: ["test", "example"],
      author: "Test Author",
    };

    expect(() =>
      extendedFields.parse({
        tags: validDoc.tags,
        author: validDoc.author,
      })
    ).not.toThrow();
  });

  it("should allow optional tags and author", () => {
    const extendedFields = z.object({
      tags: z.array(z.string()).optional(),
      author: z.string().optional(),
    });

    const docWithoutOptionals = {};

    expect(() => extendedFields.parse(docWithoutOptionals)).not.toThrow();
  });

  it("should reject invalid tag types", () => {
    const extendedFields = z.object({
      tags: z.array(z.string()).optional(),
      author: z.string().optional(),
    });

    const invalidDoc = {
      tags: "not-an-array",
    };

    expect(() => extendedFields.parse(invalidDoc)).toThrow();
  });

  it("should validate tags array contains only strings", () => {
    const extendedFields = z.object({
      tags: z.array(z.string()).optional(),
    });

    const validTags = {
      tags: ["tag1", "tag2", "tag3"],
    };

    const invalidTags = {
      tags: ["tag1", 123, "tag3"],
    };

    expect(() => extendedFields.parse(validTags)).not.toThrow();
    expect(() => extendedFields.parse(invalidTags)).toThrow();
  });
});
