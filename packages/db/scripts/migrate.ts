import { existsSync } from "node:fs";
import { loadEnvFile } from "node:process";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { createDatabase, postgresConnectionString } from "../src/index.js";

if (existsSync("../../.env")) loadEnvFile("../../.env");

function required(name: string) {
  const value = process.env[name];
  if (!value?.trim()) throw new Error(`Missing ${name} in the root .env`);
  return value;
}

const connection = createDatabase(
  postgresConnectionString({
    host: required("POSTGRES_HOST"),
    port: Number(required("POSTGRES_PORT")),
    user: required("POSTGRES_USER"),
    password: required("POSTGRES_PASSWORD"),
    database: required("POSTGRES_DB"),
  }),
);

try {
  await migrate(connection.database, { migrationsFolder: "./drizzle" });
} finally {
  await connection.pool.end();
}
