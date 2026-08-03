import * as authSchema from "@repo/db/schema";
import type { Database } from "@repo/db";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import type { ApiConfig } from "./env.js";

export function createAuth(database: Database, config: ApiConfig) {
  return betterAuth({
    database: drizzleAdapter(database, {
      provider: "pg",
      schema: authSchema,
      transaction: true,
    }),
    secret: config.betterAuthSecret,
    baseURL: config.betterAuthUrl,
    trustedOrigins: config.webOrigins,
    emailAndPassword: {
      enabled: true,
    },
    rateLimit: {
      enabled: true,
    },
    session: {
      cookieCache: {
        enabled: false,
      },
    },
  });
}

export type Auth = ReturnType<typeof createAuth>;
