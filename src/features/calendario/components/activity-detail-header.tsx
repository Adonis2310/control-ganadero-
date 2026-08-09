import { ActivityPriorityBadge } from "@/features/calendario/components/activity-priority-badge";
import { ActivityStatusBadge } from "@/features/calendario/components/activity-status-badge";
import type { ActividadConAnimal } from "@/features/calendario/types";
import { TIPO_ACTIVIDAD_LABEL } from "@/features/calendario/utils/actividad.utils";

export function ActivityDetailHeader({ actividad }: { actividad: ActividadConAnimal }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">{actividad.titulo}</h1>
        <ActivityStatusBadge estado={actividad.estado} fecha={actividad.fecha} />
        <ActivityPriorityBadge prioridad={actividad.prioridad} />
      </div>
      <p className="text-sm text-muted-foreground">{TIPO_ACTIVIDAD_LABEL[actividad.tipo]}</p>
    </div>
  );
}
