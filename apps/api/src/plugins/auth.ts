import type { AuthenticatedIdentity } from "@repo/application";
import { fromNodeHeaders } from "better-auth/node";
import type { FastifyRequest } from "fastify";
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
    app.decorate("authenticate", async (request: FastifyRequest) => {
      const identity = await readIdentity(auth, request.headers);
      if (!identity) throw new AuthenticationRequiredError("Authentication is required");
      return identity;
    });

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
        const setCookies = response.headers.getSetCookie();
        if (setCookies.length > 0) reply.header("set-cookie", setCookies);
        return reply.send(response.body ? await response.text() : null);
      },
    });
  },
  { name: "auth", dependencies: ["database"] },
);

export async function readIdentity(
  auth: Auth,
  headers: IncomingHttpHeaders,
): Promise<AuthenticatedIdentity | null> {
  const session = await auth.api.getSession({ headers: fromNodeHeaders(headers) });
  if (!session) return null;

  return { userId: session.user.id, sessionId: session.session.id };
}

declare module "fastify" {
  interface FastifyInstance {
    auth: Auth;
    authenticate(request: FastifyRequest): Promise<AuthenticatedIdentity>;
  }
}
