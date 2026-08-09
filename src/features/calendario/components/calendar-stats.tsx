import { AlertTriangle, CalendarDays, CheckCircle2, Clock, Flame } from "lucide-react";

import { StatCard } from "@/features/dashboard/components/stat-card";
import type { StatCardData } from "@/features/dashboard/types";
import type { ActividadStats } from "@/features/calendario/types";

export function CalendarStats({ stats }: { stats: ActividadStats }) {
  const cards: StatCardData[] = [
    { label: "Hoy", value: String(stats.hoy), change: "Actividades para hoy", trend: "neutral", icon: CalendarDays },
    { label: "Pendientes", value: String(stats.pendientes), change: "Por realizar", trend: "neutral", icon: Clock },
    {
      label: "Vencidas",
      value: String(stats.vencidas),
      change: stats.vencidas > 0 ? "Requieren atención" : "Al día",
      trend: stats.vencidas > 0 ? "down" : "neutral",
      icon: AlertTriangle,
    },
    { label: "Completadas", value: String(stats.completadas), change: "En el historial", trend: "neutral", icon: CheckCircle2 },
    { label: "Alta prioridad", value: String(stats.altaPrioridad), change: "Sin resolver", trend: "neutral", icon: Flame },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {cards.map((card) => (
        <StatCard key={card.label} {...card} />
      ))}
    </div>
  );
}
