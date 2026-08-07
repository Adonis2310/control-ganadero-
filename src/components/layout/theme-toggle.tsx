"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export function ThemeToggle({ className, showLabel = false }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === "dark";

  function toggleTheme() {
    setTheme(isDark ? "light" : "dark");
  }

  return (
    <Button
      variant="ghost"
      size={showLabel ? "sm" : "icon"}
      aria-label="Cambiar tema"
      onClick={toggleTheme}
      className={cn(showLabel && "rounded-full gap-1.5", className)}
    >
      {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
      {showLabel && <span>{isDark ? "Modo oscuro" : "Modo claro"}</span>}
    </Button>
  );
}
