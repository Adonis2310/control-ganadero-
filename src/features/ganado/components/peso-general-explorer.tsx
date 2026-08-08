"use client";

import { Scale, SearchX } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PesoGeneralMobile } from "@/features/ganado/components/peso-general-mobile";
import { PesoGeneralStatsCards } from "@/features/ganado/components/peso-general-stats";
import { PesoGeneralTable } from "@/features/ganado/components/peso-general-table";
import { PesoGeneralToolbar } from "@/features/ganado/components/peso-general-toolbar";
import { usePesoFilters } from "@/features/ganado/hooks/use-peso-filters";
import type { PesoConAnimal, PesoGeneralStats } from "@/features/ganado/types";
import { calcularVariacionesPorAnimal } from "@/features/ganado/utils/peso.utils";

interface PesoGeneralExplorerProps {
  pesosIniciales: PesoConAnimal[];
  stats: PesoGeneralStats;
}

export function PesoGeneralExplorer({ pesosIniciales, stats }: PesoGeneralExplorerProps) {
  const { filters, setFilters, orden, setOrden, filtered, hasActiveFilters, clearFilters } =
    usePesoFilters(pesosIniciales);

  const conVariacion = calcularVariacionesPorAnimal(filtered);

  if (pesosIniciales.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <PesoGeneralStatsCards stats={stats} />
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-20 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-muted">
            <Scale className="size-6 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <p className="font-medium">Todavía no hay pesajes registrados en la finca.</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Ve a la ficha de un animal y registra su primer peso para verlo aquí.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PesoGeneralStatsCards stats={stats} />

      <PesoGeneralToolbar
        filters={filters}
        onFiltersChange={setFilters}
        orden={orden}
        onOrdenChange={setOrden}
        hasActiveFilters={hasActiveFilters}
        onClear={clearFilters}
      />

      {conVariacion.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-16 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-muted">
            <SearchX className="size-5 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <p className="font-medium">Ningún pesaje coincide con la búsqueda</p>
            <p className="text-sm text-muted-foreground">
              Prueba ajustando los filtros o el término de búsqueda.
            </p>
          </div>
          <Button variant="outline" onClick={clearFilters}>
            Limpiar filtros
          </Button>
        </div>
      ) : (
        <>
          <PesoGeneralTable pesos={conVariacion} />
          <PesoGeneralMobile pesos={conVariacion} />
        </>
      )}
    </div>
  );
}
