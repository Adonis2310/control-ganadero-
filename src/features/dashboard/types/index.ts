import type { LucideIcon } from "lucide-react";

export interface StatCardData {
  label: string;
  value: string;
  change: string;
  trend: "up" | "down" | "neutral";
  icon: LucideIcon;
}
