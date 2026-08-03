import { describe, expect, it } from "vitest";
import { parseWebRuntimeEnvironment } from "./environment.server";

describe("web runtime environment", () => {
  it("reports every invalid owned value", () => {
    expect(() =>
      parseWebRuntimeEnvironment({
        WEB_HOST: "",
        WEB_PORT: "not-a-port",
        API_INTERNAL_ORIGIN: "relative",
      }),
    ).toThrow(/WEB_HOST[\s\S]*WEB_PORT[\s\S]*API_INTERNAL_ORIGIN/u);
  });
});
