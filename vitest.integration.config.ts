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
    include: ["**/*.integration.test.ts"],
    globalSetup: ["./scripts/test/integration-global-setup.ts"],
    fileParallelism: false,
    testTimeout: 30_000,
    hookTimeout: 60_000,
  },
});
