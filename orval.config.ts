import { defineConfig } from "orval";
import { loadEnvFile } from "node:process";

loadEnvFile();

const apiOrigin = process.env.API_INTERNAL_ORIGIN;
if (!apiOrigin) throw new Error("API_INTERNAL_ORIGIN is required");

export default defineConfig({
  api: {
    input: {
      target: new URL("/swagger-docs/json", apiOrigin).toString(),
    },
    output: {
      target: "./packages/api-client/src/generated/api.ts",
      schemas: "./packages/api-client/src/generated/models",
      mode: "single",
      client: "react-query",
      httpClient: "fetch",
      clean: true,
      override: {
        requestOptions: {
          credentials: "include",
        },
        fetch: {
          forceSuccessResponse: true,
        },
        query: {
          useQuery: true,
        },
      },
    },
  },
});
