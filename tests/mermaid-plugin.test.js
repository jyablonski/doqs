import { describe, it, expect, beforeEach } from "vitest";
import { remarkDiagram } from "../src/plugins/mermaid.mjs";

describe("Mermaid/Markmap Plugin", () => {
  it("should export remarkDiagram function", () => {
    expect(remarkDiagram).toBeDefined();
    expect(typeof remarkDiagram).toBe("function");
  });

  it("should return a transformer function", () => {
    const transformer = remarkDiagram();
    expect(typeof transformer).toBe("function");
  });

  describe("Mermaid diagram transformation", () => {
    it("should transform mermaid code blocks to HTML divs", () => {
      const tree = {
        type: "root",
        children: [
          {
            type: "code",
            lang: "mermaid",
            value: "graph TD\n  A-->B",
          },
        ],
      };

      const data = {
        astro: {
          frontmatter: {},
        },
      };

      const transformer = remarkDiagram();
      transformer(tree, { data });

      expect(tree.children[0].type).toBe("html");
      expect(tree.children[0].value).toBe(
        '<div class ="mermaid">graph TD\n  A-->B</div>'
      );
    });

    it("should add mermaid to frontmatter extra array", () => {
      const tree = {
        type: "root",
        children: [
          {
            type: "code",
            lang: "mermaid",
            value: "graph TD\n  A-->B",
          },
        ],
      };

      const data = {
        astro: {
          frontmatter: {},
        },
      };

      const transformer = remarkDiagram();
      transformer(tree, { data });

      expect(data.astro.frontmatter.extra).toBeDefined();
      expect(data.astro.frontmatter.extra).toContain("mermaid");
    });
  });

  describe("Markmap diagram transformation", () => {
    it("should transform markmap code blocks to HTML divs", () => {
      const tree = {
        type: "root",
        children: [
          {
            type: "code",
            lang: "markmap",
            value: "# Root\n## Branch",
          },
        ],
      };

      const data = {
        astro: {
          frontmatter: {},
        },
      };

      const transformer = remarkDiagram();
      transformer(tree, { data });

      expect(tree.children[0].type).toBe("html");
      expect(tree.children[0].value).toBe(
        '<div class ="markmap"># Root\n## Branch</div>'
      );
    });

    it("should add markmap to frontmatter extra array", () => {
      const tree = {
        type: "root",
        children: [
          {
            type: "code",
            lang: "markmap",
            value: "# Root\n## Branch",
          },
        ],
      };

      const data = {
        astro: {
          frontmatter: {},
        },
      };

      const transformer = remarkDiagram();
      transformer(tree, { data });

      expect(data.astro.frontmatter.extra).toBeDefined();
      expect(data.astro.frontmatter.extra).toContain("markmap");
    });
  });

  describe("Multiple diagrams", () => {
    it("should handle multiple mermaid diagrams", () => {
      const tree = {
        type: "root",
        children: [
          {
            type: "code",
            lang: "mermaid",
            value: "graph TD\n  A-->B",
          },
          {
            type: "code",
            lang: "mermaid",
            value: "graph LR\n  C-->D",
          },
        ],
      };

      const data = {
        astro: {
          frontmatter: {},
        },
      };

      const transformer = remarkDiagram();
      transformer(tree, { data });

      expect(tree.children[0].type).toBe("html");
      expect(tree.children[1].type).toBe("html");
      expect(data.astro.frontmatter.extra).toEqual(["mermaid"]);
    });

    it("should handle both mermaid and markmap diagrams", () => {
      const tree = {
        type: "root",
        children: [
          {
            type: "code",
            lang: "mermaid",
            value: "graph TD\n  A-->B",
          },
          {
            type: "code",
            lang: "markmap",
            value: "# Root\n## Branch",
          },
        ],
      };

      const data = {
        astro: {
          frontmatter: {},
        },
      };

      const transformer = remarkDiagram();
      transformer(tree, { data });

      expect(data.astro.frontmatter.extra).toContain("mermaid");
      expect(data.astro.frontmatter.extra).toContain("markmap");
      expect(data.astro.frontmatter.extra.length).toBe(2);
    });

    it("should not duplicate entries in extra array", () => {
      const tree = {
        type: "root",
        children: [
          {
            type: "code",
            lang: "mermaid",
            value: "graph TD\n  A-->B",
          },
          {
            type: "code",
            lang: "mermaid",
            value: "graph LR\n  C-->D",
          },
        ],
      };

      const data = {
        astro: {
          frontmatter: {},
        },
      };

      const transformer = remarkDiagram();
      transformer(tree, { data });

      expect(data.astro.frontmatter.extra).toEqual(["mermaid"]);
      expect(data.astro.frontmatter.extra.length).toBe(1);
    });
  });

  describe("Preserve existing frontmatter", () => {
    it("should preserve existing extra array items", () => {
      const tree = {
        type: "root",
        children: [
          {
            type: "code",
            lang: "mermaid",
            value: "graph TD\n  A-->B",
          },
        ],
      };

      const data = {
        astro: {
          frontmatter: {
            extra: ["existing-item"],
          },
        },
      };

      const transformer = remarkDiagram();
      transformer(tree, { data });

      expect(data.astro.frontmatter.extra).toContain("existing-item");
      expect(data.astro.frontmatter.extra).toContain("mermaid");
      expect(data.astro.frontmatter.extra.length).toBe(2);
    });
  });

  describe("Non-diagram code blocks", () => {
    it("should not transform regular code blocks", () => {
      const tree = {
        type: "root",
        children: [
          {
            type: "code",
            lang: "javascript",
            value: 'console.log("hello");',
          },
        ],
      };

      const data = {
        astro: {
          frontmatter: {},
        },
      };

      const transformer = remarkDiagram();
      transformer(tree, { data });

      expect(tree.children[0].type).toBe("code");
      expect(tree.children[0].lang).toBe("javascript");
      expect(tree.children[0].value).toBe('console.log("hello");');
    });

    it("should handle mixed code blocks", () => {
      const tree = {
        type: "root",
        children: [
          {
            type: "code",
            lang: "javascript",
            value: 'console.log("hello");',
          },
          {
            type: "code",
            lang: "mermaid",
            value: "graph TD\n  A-->B",
          },
          {
            type: "code",
            lang: "python",
            value: 'print("world")',
          },
        ],
      };

      const data = {
        astro: {
          frontmatter: {},
        },
      };

      const transformer = remarkDiagram();
      transformer(tree, { data });

      expect(tree.children[0].type).toBe("code");
      expect(tree.children[1].type).toBe("html");
      expect(tree.children[2].type).toBe("code");
      expect(data.astro.frontmatter.extra).toEqual(["mermaid"]);
    });
  });

  describe("Edge cases", () => {
    it("should handle empty mermaid diagram", () => {
      const tree = {
        type: "root",
        children: [
          {
            type: "code",
            lang: "mermaid",
            value: "",
          },
        ],
      };

      const data = {
        astro: {
          frontmatter: {},
        },
      };

      const transformer = remarkDiagram();
      transformer(tree, { data });

      expect(tree.children[0].type).toBe("html");
      expect(tree.children[0].value).toBe('<div class ="mermaid"></div>');
    });

    it("should handle tree with no code blocks", () => {
      const tree = {
        type: "root",
        children: [
          {
            type: "paragraph",
            children: [{ type: "text", value: "Some text" }],
          },
        ],
      };

      const data = {
        astro: {
          frontmatter: {},
        },
      };

      const transformer = remarkDiagram();
      transformer(tree, { data });

      expect(data.astro.frontmatter.extra).toEqual([]);
    });
  });
});
