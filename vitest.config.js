import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      include: ["src/**/*.{js,ts,mjs}"],
      exclude: [
        "src/content/**",
        "src/content.config.ts",
        "**/*.d.ts",
        "**/*.config.*",
        "**/node_modules/**",
        "**/*.astro",
      ],
    },
  },
});
