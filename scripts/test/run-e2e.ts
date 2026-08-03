import { PostgreSqlContainer } from "@testcontainers/postgresql";
import { createDatabase } from "@repo/db";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { spawn, type ChildProcess } from "node:child_process";
import { createServer } from "node:net";

async function freePort() {
  const server = createServer();
  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Unable to allocate a test port");
  await new Promise<void>((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve())),
  );
  return address.port;
}

async function waitFor(url: string, process: ChildProcess) {
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    if (process.exitCode !== null)
      throw new Error(`${url} process exited with ${process.exitCode}`);
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // The process is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  throw new Error(`Timed out waiting for ${url}`);
}

async function stopProcess(process: ChildProcess | undefined) {
  if (!process || process.exitCode !== null) return;
  process.kill("SIGTERM");
  await Promise.race([
    new Promise<void>((resolve) => process.once("exit", () => resolve())),
    new Promise<void>((resolve) => setTimeout(resolve, 5_000)),
  ]);
  if (process.exitCode === null) process.kill("SIGKILL");
}

const apiPort = await freePort();
let webPort = await freePort();
while (webPort === apiPort) webPort = await freePort();
const apiOrigin = `http://127.0.0.1:${apiPort}`;
const webOrigin = `http://127.0.0.1:${webPort}`;
const container = await new PostgreSqlContainer("postgres:18.3-alpine").start();
let apiProcess: ChildProcess | undefined;
let webProcess: ChildProcess | undefined;

try {
  const connection = createDatabase(container.getConnectionUri());
  try {
    await migrate(connection.database, {
      migrationsFolder: new URL("../../packages/db/drizzle", import.meta.url).pathname,
    });
  } finally {
    await connection.pool.end();
  }

  const sharedEnvironment = {
    ...process.env,
    POSTGRES_HOST: container.getHost(),
    POSTGRES_PORT: String(container.getPort()),
    POSTGRES_USER: container.getUsername(),
    POSTGRES_PASSWORD: container.getPassword(),
    POSTGRES_DB: container.getDatabase(),
    API_HOST: "127.0.0.1",
    API_PORT: String(apiPort),
    WEB_HOST: "127.0.0.1",
    WEB_PORT: String(webPort),
    API_INTERNAL_ORIGIN: apiOrigin,
    BETTER_AUTH_SECRET: "e2e-test-secret-that-is-deliberately-long-enough",
    BETTER_AUTH_URL: webOrigin,
    WEB_ORIGINS: webOrigin,
    NODE_ENV: "test",
  };

  apiProcess = spawn(
    process.execPath,
    ["--conditions=source", "--import", "tsx", "apps/api/src/index.ts"],
    { cwd: new URL("../../", import.meta.url), env: sharedEnvironment, stdio: "inherit" },
  );
  await waitFor(`${apiOrigin}/health/ready`, apiProcess);

  webProcess = spawn(
    process.execPath,
    [new URL("../../apps/web/node_modules/vite/bin/vite.js", import.meta.url).pathname, "dev"],
    {
      cwd: new URL("../../apps/web", import.meta.url),
      env: sharedEnvironment,
      stdio: "inherit",
    },
  );
  await waitFor(webOrigin, webProcess);

  const playwright = spawn(
    process.execPath,
    ["node_modules/@playwright/test/cli.js", "test", "--config", "playwright.config.ts"],
    {
      cwd: new URL("../../", import.meta.url),
      env: { ...sharedEnvironment, E2E_BASE_URL: webOrigin },
      stdio: "inherit",
    },
  );
  const exitCode = await new Promise<number>((resolve) => {
    playwright.once("exit", (code) => resolve(code ?? 1));
  });
  if (exitCode !== 0) process.exitCode = exitCode;
} finally {
  await stopProcess(webProcess);
  await stopProcess(apiProcess);
  await container.stop();
}
