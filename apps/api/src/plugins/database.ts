import { createDatabase, type Database } from "@repo/db";
import fp from "fastify-plugin";

export const databasePlugin = fp<{ databaseUrl: string }>(
  async function databasePlugin(app, options) {
    const connection = createDatabase(options.databaseUrl);
    app.decorate("database", connection.database);
    app.addHook("onClose", async () => {
      await connection.pool.end();
    });
  },
  { name: "database" },
);

declare module "fastify" {
  interface FastifyInstance {
    database: Database;
  }
}
