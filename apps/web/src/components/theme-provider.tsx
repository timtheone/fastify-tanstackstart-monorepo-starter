import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { normalizeTheme, resolveTheme, type Theme } from "~/lib/theme";

type ThemeContextValue = Readonly<{
  theme: Theme;
  setTheme: (theme: Theme) => void;
}>;

const ThemeContext = createContext<ThemeContextValue | null>(null);

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  const resolved = resolveTheme(theme, window.matchMedia("(prefers-color-scheme: dark)").matches);
  root.classList.remove("light", "dark");
  root.classList.add(resolved);
  root.style.colorScheme = resolved;
}

export function ThemeProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [theme, setThemeState] = useState<Theme>("system");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setThemeState(normalizeTheme(localStorage.getItem("theme")));
    setMounted(true);
    document.documentElement.setAttribute("data-hydrated", "true");
  }, []);

  useEffect(() => {
    if (!mounted) return;
    applyTheme(theme);
  }, [mounted, theme]);

  useEffect(() => {
    if (!mounted || theme !== "system") return;
    const preference = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => applyTheme("system");
    preference.addEventListener("change", handleChange);
    return () => preference.removeEventListener("change", handleChange);
  }, [mounted, theme]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      setTheme(nextTheme) {
        localStorage.setItem("theme", nextTheme);
        setThemeState(nextTheme);
      },
    }),
    [theme],
  );

  return <ThemeContext value={value}>{children}</ThemeContext>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
}
