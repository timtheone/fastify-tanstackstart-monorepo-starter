import type { SessionResponseBody } from "@repo/contracts";
import { fromNodeHeaders } from "better-auth/node";
import fp from "fastify-plugin";
import type { IncomingHttpHeaders } from "node:http";
import { createAuth, type Auth } from "../auth.js";
import type { ApiConfig } from "../env.js";

export class AuthenticationRequiredError extends Error {
  override readonly name = "AuthenticationRequiredError";
}

export const authPlugin = fp<{ config: ApiConfig }>(
  async function authPlugin(app, { config }) {
    const auth = createAuth(app.database, config);
    app.decorate("auth", auth);

    app.route({
      method: ["GET", "POST"],
      url: "/api/auth/*",
      schema: { hide: true },
      async handler(request, reply) {
        const response = await auth.handler(
          new Request(new URL(request.url, config.betterAuthUrl), {
            method: request.method,
            headers: fromNodeHeaders(request.headers),
            ...(request.body ? { body: JSON.stringify(request.body) } : {}),
          }),
        );

        reply.status(response.status);
        response.headers.forEach((value, key) => reply.header(key, value));
        reply.header("set-cookie", response.headers.getSetCookie());
        return reply.send(response.body ? await response.text() : null);
      },
    });
  },
  { name: "auth", dependencies: ["database"] },
);

export async function readSession(
  auth: Auth,
  headers: IncomingHttpHeaders,
): Promise<SessionResponseBody | null> {
  const session = await auth.api.getSession({ headers: fromNodeHeaders(headers) });
  if (!session) return null;

  return {
    identity: {
      userId: session.user.id,
      sessionId: session.session.id,
    },
    user: {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
    },
  };
}

declare module "fastify" {
  interface FastifyInstance {
    auth: Auth;
  }
}
