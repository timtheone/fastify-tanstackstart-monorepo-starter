import { PostgreSqlContainer } from "@testcontainers/postgresql";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { createDatabase } from "@repo/db";

export default async function setup(project: { provide(key: "databaseUrl", value: string): void }) {
  const container = await new PostgreSqlContainer("postgres:18.3-alpine").start();
  const connection = createDatabase(container.getConnectionUri());

  try {
    await migrate(connection.database, {
      migrationsFolder: new URL("../../packages/db/drizzle", import.meta.url).pathname,
    });
  } finally {
    await connection.pool.end();
  }

  project.provide("databaseUrl", container.getConnectionUri());

  return async () => {
    await container.stop();
  };
}
