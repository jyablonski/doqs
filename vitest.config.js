import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "happy-dom",
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["src/**/*.{js,ts,mjs}"],
      exclude: [
        "src/content/**",
        "**/*.d.ts",
        "**/*.config.*",
        "**/node_modules/**",
        "**/*.astro",
      ],
    },
  },
});
