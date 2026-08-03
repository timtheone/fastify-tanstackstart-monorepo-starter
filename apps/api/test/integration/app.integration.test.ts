import { createDatabase } from "@repo/db";
import { sql } from "drizzle-orm";
import { afterEach, describe, expect, inject, it } from "vitest";
import { buildApp } from "../../src/app.js";

const databaseUrl = inject("databaseUrl");
let app: Awaited<ReturnType<typeof buildApp>> | undefined;

afterEach(async () => {
  await app?.close();
  app = undefined;
  const connection = createDatabase(databaseUrl);
  try {
    await connection.database.execute(
      sql`truncate table "verification", "account", "session", "user" restart identity cascade`,
    );
  } finally {
    await connection.pool.end();
  }
});

describe("assembled Fastify application", () => {
  it("serves health signals and a database-backed email/password session", async () => {
    const instance = await buildApp({
      config: {
        host: "127.0.0.1",
        port: 3000,
        databaseUrl,
        betterAuthSecret: "integration-test-secret-that-is-long-enough",
        betterAuthUrl: "http://localhost:3001",
        webOrigins: ["http://localhost:3001"],
      },
      logger: false,
    });
    app = instance;

    const live = await instance.inject({ method: "GET", url: "/health/live" });
    expect(live.statusCode).toBe(200);
    expect(live.json()).toEqual({ status: "ok" });

    const ready = await instance.inject({ method: "GET", url: "/health/ready" });
    expect(ready.statusCode).toBe(200);

    const anonymous = await instance.inject({ method: "GET", url: "/api/session" });
    expect(anonymous.statusCode).toBe(401);
    expect(anonymous.headers["content-type"]).toContain("application/problem+json");
    expect(anonymous.json()).toMatchObject({
      type: "https://starter.invalid/problems/authentication-required",
      status: 401,
    });

    const missing = await instance.inject({ method: "GET", url: "/api/missing" });
    expect(missing.statusCode).toBe(404);
    expect(missing.headers["content-type"]).toContain("application/problem+json");
    expect(missing.json()).toMatchObject({ status: 404, title: "Not Found" });

    const registration = await instance.inject({
      method: "POST",
      url: "/api/auth/sign-up/email",
      headers: { origin: "http://localhost:3001" },
      payload: {
        email: "person@example.com",
        name: "Person",
        password: "correct horse battery staple",
      },
    });
    expect(registration.statusCode).toBe(200);

    const cookie = registration.headers["set-cookie"];
    expect(cookie).toBeTruthy();

    const session = await instance.inject({
      method: "GET",
      url: "/api/session",
      headers: { cookie },
    });
    expect(session.statusCode).toBe(200);
    expect(session.json()).toMatchObject({
      identity: { userId: expect.any(String), sessionId: expect.any(String) },
      user: { email: "person@example.com", name: "Person" },
    });
  });
});
