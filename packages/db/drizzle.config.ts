import { existsSync } from "node:fs";
import { loadEnvFile } from "node:process";
import { defineConfig } from "drizzle-kit";
import { postgresConnectionString } from "./src/config.js";

if (existsSync("../../.env")) loadEnvFile("../../.env");

function required(name: string) {
  const value = process.env[name];
  if (!value?.trim()) throw new Error(`Missing ${name} in the root .env`);
  return value;
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/schema/index.ts",
  out: "./drizzle",
  dbCredentials: {
    url: postgresConnectionString({
      host: required("POSTGRES_HOST"),
      port: Number(required("POSTGRES_PORT")),
      user: required("POSTGRES_USER"),
      password: required("POSTGRES_PASSWORD"),
      database: required("POSTGRES_DB"),
    }),
  },
});
