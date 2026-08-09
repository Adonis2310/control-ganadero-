"use client";

import type { CalendarEvent } from "@/features/calendario/types";
import {
  PRIORIDAD_DOT_CLASS,
  agruparEventosPorFecha,
  construirGridMensual,
  esEventoVencido,
  esHoy,
  formatearHora,
} from "@/features/calendario/utils/actividad.utils";
import type { PrimerDiaSemana } from "@/features/configuracion/types";
import { cn } from "@/lib/utils";

const NOMBRES_DIAS_LUNES = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const NOMBRES_DIAS_DOMINGO = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const MAX_VISIBLES = 3;

interface CalendarMonthGridProps {
  refDate: string;
  eventos: CalendarEvent[];
  onSelectDay: (fecha: string) => void;
  primerDiaSemana: PrimerDiaSemana;
}

export function CalendarMonthGrid({ refDate, eventos, onSelectDay, primerDiaSemana }: CalendarMonthGridProps) {
  const fechaRef = new Date(`${refDate}T00:00:00`);
  const celdas = construirGridMensual(fechaRef.getFullYear(), fechaRef.getMonth(), primerDiaSemana);
  const eventosPorFecha = agruparEventosPorFecha(eventos);
  const nombresDias = primerDiaSemana === "domingo" ? NOMBRES_DIAS_DOMINGO : NOMBRES_DIAS_LUNES;

  return (
    <div className="overflow-hidden rounded-lg border">
      <div className="grid grid-cols-7 border-b bg-muted/40 text-center text-xs font-medium text-muted-foreground">
        {nombresDias.map((dia) => (
          <div key={dia} className="py-2">
            {dia}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {celdas.map((celda) => {
          const eventosDia = eventosPorFecha.get(celda.fecha) ?? [];
          const visibles = eventosDia.slice(0, MAX_VISIBLES);
          const restantes = eventosDia.length - visibles.length;
          const dia = Number(celda.fecha.split("-")[2]);

          return (
            <button
              key={celda.fecha}
              type="button"
              onClick={() => onSelectDay(celda.fecha)}
              className={cn(
                "flex min-h-20 flex-col items-stretch gap-1 border-b border-r p-1.5 text-left align-top last:border-r-0 hover:bg-muted/50 sm:min-h-24 sm:p-2",
                !celda.enMes && "bg-muted/20 text-muted-foreground",
              )}
            >
              <span
                className={cn(
                  "flex size-5 items-center justify-center rounded-full text-xs font-medium",
                  esHoy(celda.fecha) && "bg-primary text-primary-foreground",
                )}
              >
                {dia}
              </span>

              {/* Chips visibles en pantallas medianas o más grandes */}
              <div className="hidden flex-col gap-0.5 sm:flex">
                {visibles.map((evento) => (
                  <span
                    key={evento.id}
                    className={cn(
                      "truncate rounded px-1 py-0.5 text-[10px] font-medium",
                      esEventoVencido(evento)
                        ? "bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300"
                        : "bg-muted text-foreground",
                    )}
                  >
                    {formatearHora(evento.horaInicio) ? `${formatearHora(evento.horaInicio)} ` : ""}
                    {evento.titulo}
                  </span>
                ))}
                {restantes > 0 && <span className="text-[10px] text-muted-foreground">+{restantes} más</span>}
              </div>

              {/* Puntos compactos en móvil */}
              {eventosDia.length > 0 && (
                <div className="flex flex-wrap gap-0.5 sm:hidden">
                  {eventosDia.slice(0, 6).map((evento) => (
                    <span key={evento.id} className={cn("size-1.5 rounded-full", PRIORIDAD_DOT_CLASS[evento.prioridad])} />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
