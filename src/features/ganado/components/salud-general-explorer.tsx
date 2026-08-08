"use client";

import { HeartPulse, SearchX } from "lucide-react";

import { Button } from "@/components/ui/button";
import { HealthTimeline } from "@/features/ganado/components/health-timeline";
import { SaludGeneralStats } from "@/features/ganado/components/salud-general-stats";
import { SaludGeneralToolbar } from "@/features/ganado/components/salud-general-toolbar";
import { useSaludFilters } from "@/features/ganado/hooks/use-salud-filters";
import type { AnimalRef, HealthDashboardAlerts, RegistroSalud } from "@/features/ganado/types";

interface SaludGeneralExplorerProps {
  registrosIniciales: RegistroSalud[];
  alertas: HealthDashboardAlerts;
  animales: AnimalRef[];
}

export function SaludGeneralExplorer({
  registrosIniciales,
  alertas,
  animales,
}: SaludGeneralExplorerProps) {
  const { filters, setFilters, estado, setEstado, filtered, hasActiveFilters, clearFilters } =
    useSaludFilters(registrosIniciales);

  if (registrosIniciales.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <SaludGeneralStats alertas={alertas} />
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-20 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-muted">
            <HeartPulse className="size-6 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <p className="font-medium">Todavía no hay registros sanitarios en la finca.</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Ve a la ficha de un animal y registra su primera vacuna, desparasitación o
              enfermedad para verla aquí.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <SaludGeneralStats alertas={alertas} />

      <SaludGeneralToolbar
        filters={filters}
        onFiltersChange={setFilters}
        estado={estado}
        onEstadoChange={setEstado}
        animales={animales}
        hasActiveFilters={hasActiveFilters}
        onClear={clearFilters}
      />

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-16 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-muted">
            <SearchX className="size-5 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <p className="font-medium">Ningún registro coincide con la búsqueda</p>
            <p className="text-sm text-muted-foreground">
              Prueba ajustando los filtros o el término de búsqueda.
            </p>
          </div>
          <Button variant="outline" onClick={clearFilters}>
            Limpiar filtros
          </Button>
        </div>
      ) : (
        <HealthTimeline registros={filtered} mostrarAnimal />
      )}
    </div>
  );
}
