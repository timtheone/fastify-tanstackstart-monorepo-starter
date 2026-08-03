import { describe, expect, it } from "vitest";
import { normalizeTheme, resolveTheme } from "./theme";

describe("theme preference", () => {
  it("defaults invalid stored values to system and resolves system from the media preference", () => {
    expect(normalizeTheme("midnight")).toBe("system");
    expect(normalizeTheme("dark")).toBe("dark");
    expect(resolveTheme("system", true)).toBe("dark");
    expect(resolveTheme("system", false)).toBe("light");
    expect(resolveTheme("light", true)).toBe("light");
  });
});
