import { Badge } from "@/components/ui/badge";
import type { PrioridadActividad } from "@/features/calendario/types";
import { PRIORIDAD_ACTIVIDAD_BADGE_CLASS, PRIORIDAD_ACTIVIDAD_LABEL } from "@/features/calendario/utils/actividad.utils";
import { cn } from "@/lib/utils";

export function ActivityPriorityBadge({ prioridad }: { prioridad: PrioridadActividad }) {
  return (
    <Badge variant="outline" className={cn("border-transparent font-medium", PRIORIDAD_ACTIVIDAD_BADGE_CLASS[prioridad])}>
      {PRIORIDAD_ACTIVIDAD_LABEL[prioridad]}
    </Badge>
  );
}
