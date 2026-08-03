import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { ProblemDetails, SessionResponse } from "@repo/contracts";
import { readSession, AuthenticationRequiredError } from "../plugins/auth.js";

export const sessionRoutes: FastifyPluginAsyncTypebox = async (app) => {
  app.get(
    "/api/session",
    {
      schema: {
        operationId: "getSession",
        tags: ["Session"],
        response: {
          200: SessionResponse,
          401: ProblemDetails,
          500: ProblemDetails,
        },
      },
    },
    async (request) => {
      const session = await readSession(app.auth, request.headers);
      if (!session) throw new AuthenticationRequiredError("Authentication is required");
      return session;
    },
  );
};
