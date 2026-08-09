"use client";

import { ActivityCard } from "@/features/calendario/components/activity-card";
import type { CalendarEvent } from "@/features/calendario/types";
import { agruparEventosPorFecha, construirDiasSemana, esHoy, nombreDiaCorto } from "@/features/calendario/utils/actividad.utils";
import type { PrimerDiaSemana } from "@/features/configuracion/types";
import { cn } from "@/lib/utils";

interface CalendarWeekViewProps {
  refDate: string;
  eventos: CalendarEvent[];
  onSelectDay: (fecha: string) => void;
  primerDiaSemana: PrimerDiaSemana;
}

export function CalendarWeekView({ refDate, eventos, onSelectDay, primerDiaSemana }: CalendarWeekViewProps) {
  const dias = construirDiasSemana(refDate, primerDiaSemana);
  const eventosPorFecha = agruparEventosPorFecha(eventos);

  return (
    <div className="flex flex-col gap-3">
      {dias.map((fecha) => {
        const eventosDia = eventosPorFecha.get(fecha) ?? [];
        const numeroDia = Number(fecha.split("-")[2]);

        return (
          <div key={fecha} className="rounded-lg border">
            <button
              type="button"
              onClick={() => onSelectDay(fecha)}
              className="flex w-full items-center gap-2 border-b bg-muted/30 px-3 py-2 text-left text-sm font-medium hover:bg-muted/50"
            >
              <span
                className={cn(
                  "flex size-6 items-center justify-center rounded-full text-xs",
                  esHoy(fecha) && "bg-primary text-primary-foreground",
                )}
              >
                {numeroDia}
              </span>
              {nombreDiaCorto(fecha)}
              <span className="ml-auto text-xs font-normal text-muted-foreground">
                {eventosDia.length > 0 ? `${eventosDia.length} actividad${eventosDia.length === 1 ? "" : "es"}` : "Sin actividades"}
              </span>
            </button>

            {eventosDia.length > 0 && (
              <div className="flex flex-col gap-2 p-2">
                {eventosDia.map((evento) => (
                  <ActivityCard key={evento.id} evento={evento} />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
