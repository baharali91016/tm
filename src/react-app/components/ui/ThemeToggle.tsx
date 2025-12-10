import { useTheme } from "../theme-provider";
import { Button } from "./button";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const { setTheme, actualTheme } = useTheme();

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setTheme(actualTheme === "dark" ? "light" : "dark")}
        className="h-9 w-9"
        aria-label="Toggle theme"
      >
        {actualTheme === "dark" ? (
          <Sun className="h-4 w-4" />
        ) : (
          <Moon className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}
