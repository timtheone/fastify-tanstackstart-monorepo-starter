import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { sql } from "drizzle-orm";
import { Object, Literal, Union } from "typebox";

const LiveResponse = Object({ status: Literal("ok") }, { additionalProperties: false });
const ReadyResponse = Union([
  Object({ status: Literal("ok") }, { additionalProperties: false }),
  Object({ status: Literal("unavailable") }, { additionalProperties: false }),
]);

export const healthRoutes: FastifyPluginAsyncTypebox = async (app) => {
  app.get(
    "/health/live",
    {
      schema: { hide: true, response: { 200: LiveResponse } },
    },
    async () => ({ status: "ok" as const }),
  );

  app.get(
    "/health/ready",
    {
      schema: { hide: true, response: { 200: ReadyResponse, 503: ReadyResponse } },
    },
    async (_request, reply) => {
      try {
        await app.database.execute(sql`select 1`);
        return { status: "ok" as const };
      } catch {
        return reply.code(503).send({ status: "unavailable" as const });
      }
    },
  );
};
