import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "happy-dom",
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"], // Add 'lcov' here
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
