import { existsSync } from "node:fs";
import { loadEnvFile } from "node:process";
import { buildApp } from "./app.js";
import { parseApiEnvironment } from "./env.js";

if (existsSync("../../.env")) loadEnvFile("../../.env");

const config = parseApiEnvironment(process.env);
const runtime =
  process.env.NODE_ENV === "production"
    ? "production"
    : process.env.NODE_ENV === "test"
      ? "test"
      : "development";
const app = await buildApp({ config, runtime });
let closing = false;

async function shutdown(signal: NodeJS.Signals) {
  if (closing) return;
  closing = true;
  app.log.info({ signal }, "Shutting down API");

  try {
    await app.close();
  } catch (error) {
    app.log.error({ err: error }, "API shutdown failed");
    process.exitCode = 1;
  }
}

process.once("SIGINT", () => void shutdown("SIGINT"));
process.once("SIGTERM", () => void shutdown("SIGTERM"));

try {
  await app.listen({ host: config.host, port: config.port });
} catch (error) {
  app.log.error({ err: error }, "API failed to start");
  process.exitCode = 1;
  await app.close();
}
