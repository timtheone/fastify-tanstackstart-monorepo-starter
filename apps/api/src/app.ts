import cors from "@fastify/cors";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import type { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import type { FastifyServerOptions } from "fastify";
import Fastify from "fastify";
import type { ApiConfig } from "./env.js";
import { authPlugin } from "./plugins/auth.js";
import { databasePlugin } from "./plugins/database.js";
import { installProblemDetails } from "./problem-details.js";
import { healthRoutes } from "./routes/health.js";

export type BuildAppOptions = Readonly<{
  config: ApiConfig;
  logger?: NonNullable<FastifyServerOptions["logger"]>;
  runtime?: "development" | "test" | "production";
}>;

function loggerFor(
  runtime: BuildAppOptions["runtime"],
): NonNullable<FastifyServerOptions["logger"]> {
  if (runtime === "test") return false;

  return {
    level: runtime === "development" ? "debug" : "info",
    redact: {
      paths: [
        "req.headers.authorization",
        "req.headers.cookie",
        "*.password",
        "*.secret",
        "*.token",
      ],
      censor: "[REDACTED]",
    },
    ...(runtime === "development"
      ? {
          transport: {
            target: "pino-pretty",
            options: { colorize: true, translateTime: "HH:MM:ss Z", ignore: "pid,hostname" },
          },
        }
      : {}),
  };
}

export async function buildApp(options: BuildAppOptions) {
  const fastifyOptions: FastifyServerOptions = {
    logger: options.logger ?? loggerFor(options.runtime),
  };
  const app = Fastify(fastifyOptions).withTypeProvider<TypeBoxTypeProvider>();

  installProblemDetails(app);
  await app.register(cors, {
    origin: options.config.webOrigins,
    credentials: true,
  });
  await app.register(swagger, {
    openapi: {
      info: {
        title: "Application API",
        version: "1.0.0",
      },
    },
  });
  await app.register(swaggerUi, { routePrefix: "/swagger-docs" });
  await app.register(databasePlugin, { databaseUrl: options.config.databaseUrl });
  await app.register(authPlugin, { config: options.config });
  await app.register(healthRoutes);
  await app.ready();

  return app;
}
