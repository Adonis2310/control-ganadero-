"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { CalendarViewMode } from "@/features/calendario/types";
import {
  construirDiasSemana,
  formatearEtiquetaDia,
  formatearEtiquetaMes,
  formatearEtiquetaSemana,
} from "@/features/calendario/utils/actividad.utils";
import type { PrimerDiaSemana } from "@/features/configuracion/types";

interface CalendarHeaderProps {
  viewMode: CalendarViewMode;
  onViewModeChange: (mode: CalendarViewMode) => void;
  refDate: string;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
  primerDiaSemana: PrimerDiaSemana;
}

function etiquetaPara(viewMode: CalendarViewMode, refDate: string, primerDiaSemana: PrimerDiaSemana): string {
  if (viewMode === "mes") return formatearEtiquetaMes(refDate);
  if (viewMode === "semana") return formatearEtiquetaSemana(construirDiasSemana(refDate, primerDiaSemana));
  return formatearEtiquetaDia(refDate);
}

export function CalendarHeader({ viewMode, onViewModeChange, refDate, onPrevious, onNext, onToday, primerDiaSemana }: CalendarHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={onPrevious} aria-label="Anterior">
          <ChevronLeft className="size-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={onToday}>
          Hoy
        </Button>
        <Button variant="outline" size="icon" onClick={onNext} aria-label="Siguiente">
          <ChevronRight className="size-4" />
        </Button>
        <h2 className="ml-1 text-sm font-semibold capitalize sm:text-base">{etiquetaPara(viewMode, refDate, primerDiaSemana)}</h2>
      </div>

      <Tabs value={viewMode} onValueChange={(value) => value && onViewModeChange(value as CalendarViewMode)}>
        <TabsList>
          <TabsTrigger value="mes">Mes</TabsTrigger>
          <TabsTrigger value="semana">Semana</TabsTrigger>
          <TabsTrigger value="dia">Día</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
