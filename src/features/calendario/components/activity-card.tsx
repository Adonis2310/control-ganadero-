import Link from "next/link";
import { ExternalLink } from "lucide-react";

import { ActivityPriorityBadge } from "@/features/calendario/components/activity-priority-badge";
import { ActivityStatusBadge } from "@/features/calendario/components/activity-status-badge";
import type { CalendarEvent } from "@/features/calendario/types";
import { TIPO_ACTIVIDAD_LABEL, formatearFechaActividad, formatearHora } from "@/features/calendario/utils/actividad.utils";
import { cn } from "@/lib/utils";

interface ActivityCardProps {
  evento: CalendarEvent;
  mostrarFecha?: boolean;
}

export function ActivityCard({ evento, mostrarFecha }: ActivityCardProps) {
  const hora = formatearHora(evento.horaInicio);
  const horaFin = formatearHora(evento.horaFin);

  return (
    <Link
      href={evento.href ?? "#"}
      className={cn(
        "flex flex-col gap-2 rounded-lg border p-3 text-sm transition-colors hover:bg-muted/50 sm:flex-row sm:items-center sm:justify-between",
        evento.readonly && "border-dashed",
      )}
    >
      <div className="flex min-w-0 flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          {(hora || mostrarFecha) && (
            <span className="text-xs font-medium text-muted-foreground">
              {mostrarFecha ? formatearFechaActividad(evento.fecha) : null}
              {mostrarFecha && hora ? " · " : null}
              {hora ? `${hora}${horaFin ? ` – ${horaFin}` : ""}` : null}
            </span>
          )}
          <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground uppercase">
            {TIPO_ACTIVIDAD_LABEL[evento.tipo]}
          </span>
          {evento.readonly && <ExternalLink className="size-3 text-muted-foreground" />}
        </div>
        <p className="truncate font-medium">
          {evento.titulo}
          {evento.animal && (
            <span className="font-normal text-muted-foreground">
              {" "}
              — {evento.animal.identificador}
              {evento.animal.nombre ? ` (${evento.animal.nombre})` : ""}
            </span>
          )}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <ActivityPriorityBadge prioridad={evento.prioridad} />
        {!evento.readonly && <ActivityStatusBadge estado={evento.estado} fecha={evento.fecha} />}
      </div>
    </Link>
  );
}
