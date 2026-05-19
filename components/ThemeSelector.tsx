"use client";

import { Palette } from "lucide-react";
import { useTheme } from "./ThemeProvider";

const THEMES = [
  { value: "concert", label: "Concert Night" },
  { value: "synthwave", label: "Synthwave" },
  { value: "cyberpunk", label: "Cyberpunk" },
  { value: "sunset", label: "Sunset" },
  { value: "cupcake", label: "Cupcake" },
  { value: "night", label: "Night" },
];

type ThemeSelectorProps = {
  className?: string;
  compact?: boolean;
};

export function ThemeSelector({ className = "", compact }: ThemeSelectorProps) {
  const { theme, setTheme } = useTheme();

  return (
    <label className={`form-control w-full max-w-xs ${className}`}>
      {!compact && (
        <div className="label">
          <span className="label-text flex items-center gap-2">
            <Palette className="h-4 w-4 text-primary" />
            Theme
          </span>
        </div>
      )}
      <select
        className="select select-bordered select-sm w-full border-primary/30 focus:border-primary"
        value={theme}
        onChange={(e) => setTheme(e.target.value)}
        aria-label="Choose app theme"
      >
        {THEMES.map((t) => (
          <option key={t.value} value={t.value}>
            {t.label}
          </option>
        ))}
      </select>
    </label>
  );
}
