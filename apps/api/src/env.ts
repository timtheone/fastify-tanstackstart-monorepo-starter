import * as v from "valibot";
import { postgresConnectionString } from "@repo/db";

const Port = v.pipe(
  v.string(),
  v.transform((value) => Number(value)),
  v.number(),
  v.integer(),
  v.minValue(1),
  v.maxValue(65_535),
);

const Origins = v.pipe(
  v.string(),
  v.transform((value) => value.split(",").map((origin) => origin.trim())),
  v.array(v.pipe(v.string(), v.url())),
  v.check((origins) => !origins.includes("*"), "WEB_ORIGINS cannot contain a wildcard"),
);

const ApiEnvironment = v.object({
  POSTGRES_HOST: v.pipe(v.string(), v.nonEmpty()),
  POSTGRES_PORT: Port,
  POSTGRES_USER: v.pipe(v.string(), v.nonEmpty()),
  POSTGRES_PASSWORD: v.pipe(v.string(), v.nonEmpty()),
  POSTGRES_DB: v.pipe(v.string(), v.nonEmpty()),
  API_HOST: v.pipe(v.string(), v.nonEmpty()),
  API_PORT: Port,
  BETTER_AUTH_SECRET: v.pipe(v.string(), v.minLength(32)),
  BETTER_AUTH_URL: v.pipe(v.string(), v.url()),
  WEB_ORIGINS: Origins,
});

export type ApiConfig = Readonly<{
  host: string;
  port: number;
  databaseUrl: string;
  betterAuthSecret: string;
  betterAuthUrl: string;
  webOrigins: string[];
}>;

export function parseApiEnvironment(environment: NodeJS.ProcessEnv): ApiConfig {
  const result = v.safeParse(ApiEnvironment, environment);
  if (!result.success) {
    throw new Error(
      `Invalid API configuration:\n${result.issues
        .map((issue) => `- ${v.getDotPath(issue) ?? "environment"}: ${issue.message}`)
        .join("\n")}`,
    );
  }

  return {
    host: result.output.API_HOST,
    port: result.output.API_PORT,
    databaseUrl: postgresConnectionString({
      host: result.output.POSTGRES_HOST,
      port: result.output.POSTGRES_PORT,
      user: result.output.POSTGRES_USER,
      password: result.output.POSTGRES_PASSWORD,
      database: result.output.POSTGRES_DB,
    }),
    betterAuthSecret: result.output.BETTER_AUTH_SECRET,
    betterAuthUrl: result.output.BETTER_AUTH_URL,
    webOrigins: result.output.WEB_ORIGINS,
  };
}
