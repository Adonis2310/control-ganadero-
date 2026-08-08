"use client";

import { HeartHandshake, SearchX } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ReproduccionActivePregnancies } from "@/features/ganado/components/reproduccion-active-pregnancies";
import { ReproduccionGeneralStatsCards } from "@/features/ganado/components/reproduccion-general-stats";
import { ReproduccionGeneralTable } from "@/features/ganado/components/reproduccion-general-table";
import { ReproduccionGeneralToolbar } from "@/features/ganado/components/reproduccion-general-toolbar";
import { ReproduccionRecentEvents } from "@/features/ganado/components/reproduccion-recent-events";
import { ReproduccionUpcomingBirths } from "@/features/ganado/components/reproduccion-upcoming-births";
import { useReproduccionFilters } from "@/features/ganado/hooks/use-reproduccion-filters";
import type { AnimalRef, SexoAnimal } from "@/features/ganado/types";
import type { DatosGeneralesReproduccion } from "@/features/ganado/utils/reproduccion.utils";

interface ReproduccionGeneralExplorerProps {
  datos: DatosGeneralesReproduccion;
  animales: (AnimalRef & { sexo: SexoAnimal })[];
}

export function ReproduccionGeneralExplorer({ datos, animales }: ReproduccionGeneralExplorerProps) {
  const { filters, setFilters, filtered, hasActiveFilters, clearFilters } = useReproduccionFilters(
    datos.listado,
  );

  if (animales.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <ReproduccionGeneralStatsCards stats={datos.stats} />
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-20 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-muted">
            <HeartHandshake className="size-6 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <p className="font-medium">Todavía no hay animales registrados en la finca.</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Registra animales en el módulo de Ganado para empezar a llevar su control
              reproductivo.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <ReproduccionGeneralStatsCards stats={datos.stats} />

      <div className="grid gap-4 lg:grid-cols-3">
        <ReproduccionUpcomingBirths partos={datos.proximosPartos} />
        <ReproduccionActivePregnancies gestaciones={datos.gestacionesActivas} />
        <ReproduccionRecentEvents eventos={datos.eventosRecientes} />
      </div>

      <ReproduccionGeneralToolbar
        filters={filters}
        onFiltersChange={setFilters}
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
            <p className="font-medium">Ningún animal coincide con la búsqueda</p>
            <p className="text-sm text-muted-foreground">
              Prueba ajustando los filtros o el término de búsqueda.
            </p>
          </div>
          <Button variant="outline" onClick={clearFilters}>
            Limpiar filtros
          </Button>
        </div>
      ) : (
        <ReproduccionGeneralTable listado={filtered} />
      )}
    </div>
  );
}
