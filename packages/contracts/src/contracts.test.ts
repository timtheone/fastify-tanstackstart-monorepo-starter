import { Check } from "typebox/value";
import { describe, expect, it } from "vitest";
import { ProblemDetails, SessionResponse } from "./index.js";

describe("HTTP contracts", () => {
  it("accepts RFC 9457 validation problems and rejects arbitrary error envelopes", () => {
    expect(
      Check(ProblemDetails, {
        type: "https://example.invalid/problems/request-validation",
        title: "Request validation failed",
        status: 400,
        detail: "One or more request values are invalid.",
        instance: "/api/example",
        requestId: "request-1",
        errors: [{ pointer: "/email", detail: "must match format email", keyword: "format" }],
      }),
    ).toBe(true);
    expect(Check(ProblemDetails, { error: "bad request" })).toBe(false);
  });

  it("exposes only the application session projection", () => {
    expect(
      Check(SessionResponse, {
        identity: { userId: "user-1", sessionId: "session-1" },
        user: { id: "user-1", email: "person@example.com", name: "Person" },
      }),
    ).toBe(true);
    expect(
      Check(SessionResponse, {
        identity: { userId: "user-1", sessionId: "session-1", token: "secret" },
        user: { id: "user-1", email: "person@example.com", name: "Person" },
      }),
    ).toBe(false);
  });
});
