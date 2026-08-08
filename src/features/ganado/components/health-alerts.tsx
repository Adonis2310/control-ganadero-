import { AlertTriangle } from "lucide-react";

import type { AnimalHealthAlerts } from "@/features/ganado/types";
import { cn } from "@/lib/utils";

const ALERT_CONFIG: {
  key: keyof AnimalHealthAlerts;
  label: string;
  tone: "atencion" | "negativo";
}[] = [
  { key: "vacunaVencida", label: "Vacuna vencida", tone: "negativo" },
  { key: "vacunaProxima", label: "Vacuna próxima", tone: "atencion" },
  { key: "desparasitacionVencida", label: "Desparasitación vencida", tone: "negativo" },
  { key: "desparasitacionProxima", label: "Desparasitación próxima", tone: "atencion" },
  { key: "enfermedadActiva", label: "Animal con enfermedad activa", tone: "negativo" },
];

const TONE_CLASS: Record<"atencion" | "negativo", string> = {
  atencion:
    "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300",
  negativo:
    "border-red-200 bg-red-50 text-red-800 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300",
};

export function HealthAlerts({ alertas }: { alertas: AnimalHealthAlerts }) {
  const activas = ALERT_CONFIG.filter((alerta) => alertas[alerta.key]);
  if (activas.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {activas.map((alerta) => (
        <span
          key={alerta.key}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium",
            TONE_CLASS[alerta.tone],
          )}
        >
          <AlertTriangle className="size-3.5" />
          {alerta.label}
        </span>
      ))}
    </div>
  );
}
