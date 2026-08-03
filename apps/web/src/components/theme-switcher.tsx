import { DesktopIcon, MoonIcon, SunIcon } from "@phosphor-icons/react";
import type { KeyboardEvent } from "react";
import { Button } from "~/components/ui/button";
import { useTheme } from "~/components/theme-provider";

const choices = [
  { value: "system", label: "System", icon: DesktopIcon },
  { value: "light", label: "Light", icon: SunIcon },
  { value: "dark", label: "Dark", icon: MoonIcon },
] as const;

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  function moveSelection(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let nextIndex: number | undefined;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      nextIndex = (index + 1) % choices.length;
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      nextIndex = (index - 1 + choices.length) % choices.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = choices.length - 1;
    }

    if (nextIndex === undefined) return;
    event.preventDefault();
    const nextTheme = choices[nextIndex]?.value;
    if (!nextTheme) return;
    setTheme(nextTheme);
    event.currentTarget.parentElement
      ?.querySelectorAll<HTMLElement>('[role="radio"]')
      [nextIndex]?.focus();
  }

  return (
    <div
      className="inline-flex gap-1 rounded-lg border bg-card p-1"
      role="radiogroup"
      aria-label="Theme"
    >
      {choices.map(({ value, label, icon: Icon }, index) => (
        <Button
          key={value}
          type="button"
          role="radio"
          aria-checked={theme === value}
          aria-label={label}
          title={label}
          tabIndex={theme === value ? 0 : -1}
          variant={theme === value ? "secondary" : "ghost"}
          size="icon-sm"
          onClick={() => setTheme(value)}
          onKeyDown={(event) => moveSelection(event, index)}
        >
          <Icon aria-hidden="true" />
        </Button>
      ))}
    </div>
  );
}
