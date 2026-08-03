export type Theme = "light" | "dark" | "system";
export type ResolvedTheme = Exclude<Theme, "system">;

export function normalizeTheme(value: string | null): Theme {
  return value === "light" || value === "dark" || value === "system" ? value : "system";
}

export function resolveTheme(theme: Theme, prefersDark: boolean): ResolvedTheme {
  return theme === "system" ? (prefersDark ? "dark" : "light") : theme;
}
