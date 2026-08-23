import { Check } from "typebox/value";
import { describe, expect, it } from "vitest";
import { ProblemDetails } from "./index.js";

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
});
