import { AlertTriangle, CalendarClock, Flame } from "lucide-react";

import type { ActividadStats } from "@/features/calendario/types";
import { cn } from "@/lib/utils";

function AlertBanner({ icon: Icon, tone, children }: { icon: typeof AlertTriangle; tone: "warning" | "info" | "danger"; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm",
        tone === "danger" && "border-red-200 bg-red-50 text-red-800 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300",
        tone === "warning" && "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300",
        tone === "info" && "border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300",
      )}
    >
      <Icon className="size-4 shrink-0" />
      <span>{children}</span>
    </div>
  );
}

export function CalendarAlerts({ stats }: { stats: ActividadStats }) {
  if (stats.vencidas === 0 && stats.hoy === 0 && stats.altaPrioridad === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      {stats.vencidas > 0 && (
        <AlertBanner icon={AlertTriangle} tone="danger">
          {stats.vencidas} actividad{stats.vencidas === 1 ? "" : "es"} {stats.vencidas === 1 ? "está" : "están"} vencida
          {stats.vencidas === 1 ? "" : "s"}.
        </AlertBanner>
      )}
      {stats.hoy > 0 && (
        <AlertBanner icon={CalendarClock} tone="info">
          {stats.hoy} actividad{stats.hoy === 1 ? "" : "es"} programada{stats.hoy === 1 ? "" : "s"} para hoy.
        </AlertBanner>
      )}
      {stats.altaPrioridad > 0 && (
        <AlertBanner icon={Flame} tone="warning">
          {stats.altaPrioridad} actividad{stats.altaPrioridad === 1 ? "" : "es"} de alta prioridad sin resolver.
        </AlertBanner>
      )}
    </div>
  );
}
