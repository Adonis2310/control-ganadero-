"use client";

import Link from "next/link";
import { useState } from "react";
import { CalendarCheck2, ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ActivityPriorityBadge } from "@/features/calendario/components/activity-priority-badge";
import { ActivityStatusConfirmDialog } from "@/features/calendario/components/activity-status-confirm-dialog";
import { RescheduleActivityDialog } from "@/features/calendario/components/reschedule-activity-dialog";
import type { ActividadConAnimal, CalendarEvent } from "@/features/calendario/types";
import { TIPO_ACTIVIDAD_LABEL, esEventoVencido, formatearFechaActividad } from "@/features/calendario/utils/actividad.utils";

interface OverdueActivitiesProps {
  eventos: CalendarEvent[];
  actividadesPorId: Map<string, ActividadConAnimal>;
  onChanged: () => void;
}

export function OverdueActivities({ eventos, actividadesPorId, onChanged }: OverdueActivitiesProps) {
  const [reprogramar, setReprogramar] = useState<ActividadConAnimal | null>(null);
  const [completar, setCompletar] = useState<ActividadConAnimal | null>(null);

  const vencidas = eventos.filter(esEventoVencido);

  if (vencidas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-10 text-center">
        <CalendarCheck2 className="size-5 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">No hay actividades vencidas.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {vencidas.map((evento) => {
        const actividad = evento.actividadId ? actividadesPorId.get(evento.actividadId) : undefined;

        return (
          <div key={evento.id} className="flex flex-col gap-2 rounded-lg border border-red-200 p-3 text-sm dark:border-red-500/30 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 flex-col gap-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-medium text-red-700 dark:text-red-400">
                  Vencida desde el {formatearFechaActividad(evento.fecha)}
                </span>
                <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground uppercase">
                  {TIPO_ACTIVIDAD_LABEL[evento.tipo]}
                </span>
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

            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <ActivityPriorityBadge prioridad={evento.prioridad} />
              {actividad ? (
                <>
                  <Button variant="outline" size="sm" onClick={() => setReprogramar(actividad)}>
                    Reprogramar
                  </Button>
                  <Button size="sm" onClick={() => setCompletar(actividad)}>
                    Completar
                  </Button>
                </>
              ) : (
                <Button variant="ghost" size="sm" nativeButton={false} render={<Link href={evento.href ?? "#"} />}>
                  Ver animal
                  <ExternalLink className="size-3.5" />
                </Button>
              )}
            </div>
          </div>
        );
      })}

      <RescheduleActivityDialog
        actividad={reprogramar}
        open={reprogramar !== null}
        onOpenChange={(open) => !open && setReprogramar(null)}
        onRescheduled={onChanged}
      />
      <ActivityStatusConfirmDialog
        actividad={completar}
        open={completar !== null}
        onOpenChange={(open) => !open && setCompletar(null)}
        onChanged={onChanged}
        targetEstado="completada"
      />
    </div>
  );
}
