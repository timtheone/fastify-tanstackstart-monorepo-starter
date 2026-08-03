import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    conditions: ["source"],
  },
  ssr: {
    resolve: {
      conditions: ["source", "node"],
    },
  },
  test: {
    include: [
      "scripts/**/*.test.ts",
      "packages/**/*.test.ts",
      "apps/web/src/**/*.test.ts",
      "apps/web/src/**/*.test.tsx",
    ],
    exclude: ["**/*.integration.test.ts", "**/node_modules/**"],
  },
});
