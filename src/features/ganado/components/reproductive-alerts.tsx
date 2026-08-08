import { AlertTriangle, Info } from "lucide-react";

import type { GestacionRow } from "@/features/ganado/types";
import { calcularAlertaParto } from "@/features/ganado/utils/reproduccion.utils";
import { cn } from "@/lib/utils";

const ALERTA_LABEL: Record<string, string> = {
  proximo: "Parto próximo",
  hoy: "Parto estimado hoy",
  superado: "Fecha estimada superada",
};

const ALERTA_TONE: Record<string, string> = {
  proximo:
    "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300",
  hoy: "border-fuchsia-200 bg-fuchsia-50 text-fuchsia-800 dark:border-fuchsia-500/20 dark:bg-fuchsia-500/10 dark:text-fuchsia-300",
  superado:
    "border-red-200 bg-red-50 text-red-800 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300",
};

export function ReproductiveAlerts({ gestacionActual }: { gestacionActual: GestacionRow | null }) {
  if (!gestacionActual) return null;
  const alerta = calcularAlertaParto(gestacionActual);
  if (!alerta) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium",
          ALERTA_TONE[alerta],
        )}
      >
        <AlertTriangle className="size-3.5" />
        {ALERTA_LABEL[alerta]}
      </span>
      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
        <Info className="size-3.5" />
        Estimación informativa, no un dato veterinario exacto.
      </span>
    </div>
  );
}
