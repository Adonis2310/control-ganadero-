import { Badge } from "@/components/ui/badge";
import type { EstadoActividad } from "@/features/calendario/types";
import { ESTADO_ACTIVIDAD_BADGE_CLASS, ESTADO_ACTIVIDAD_LABEL, esVencida } from "@/features/calendario/utils/actividad.utils";
import { cn } from "@/lib/utils";

interface ActivityStatusBadgeProps {
  estado: EstadoActividad;
  fecha?: string;
}

/** Si se pasa `fecha`, una actividad pendiente/en progreso ya vencida se muestra como "Vencida" (estado calculado, no persistido). */
export function ActivityStatusBadge({ estado, fecha }: ActivityStatusBadgeProps) {
  const vencida = fecha !== undefined && esVencida({ fecha, estado });

  if (vencida) {
    return (
      <Badge variant="outline" className="border-transparent bg-red-100 font-medium text-red-800 dark:bg-red-500/15 dark:text-red-300">
        Vencida
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className={cn("border-transparent font-medium", ESTADO_ACTIVIDAD_BADGE_CLASS[estado])}>
      {ESTADO_ACTIVIDAD_LABEL[estado]}
    </Badge>
  );
}
