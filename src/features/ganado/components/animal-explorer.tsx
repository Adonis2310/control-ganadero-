"use client";

import { useState } from "react";

import { AnimalEmptyState } from "@/features/ganado/components/animal-empty-state";
import { AnimalMobileList } from "@/features/ganado/components/animal-mobile-list";
import { AnimalStatsCards } from "@/features/ganado/components/animal-stats";
import { AnimalTable } from "@/features/ganado/components/animal-table";
import { AnimalToolbar } from "@/features/ganado/components/animal-toolbar";
import { DeleteAnimalDialog } from "@/features/ganado/components/delete-animal-dialog";
import { useAnimalFilters } from "@/features/ganado/hooks/use-animal-filters";
import type { Animal, AnimalStats, Raza } from "@/features/ganado/types";

interface AnimalExplorerProps {
  animalesIniciales: Animal[];
  razas: Raza[];
  stats: AnimalStats;
}

export function AnimalExplorer({
  animalesIniciales,
  razas,
  stats,
}: AnimalExplorerProps) {
  const [animales, setAnimales] = useState(animalesIniciales);
  const [animalAEliminar, setAnimalAEliminar] = useState<Animal | null>(null);
  const { filters, setFilters, filtered, hasActiveFilters, clearFilters } =
    useAnimalFilters(animales);

  function handleDeleted(id: string) {
    setAnimales((prev) => prev.filter((animal) => animal.id !== id));
  }

  if (animales.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <AnimalStatsCards stats={stats} />
        <AnimalEmptyState variant="sin-animales" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <AnimalStatsCards stats={stats} />

      <AnimalToolbar
        filters={filters}
        onFiltersChange={setFilters}
        razas={razas}
        hasActiveFilters={hasActiveFilters}
        onClear={clearFilters}
      />

      {filtered.length === 0 ? (
        <AnimalEmptyState variant="sin-resultados" onClearFilters={clearFilters} />
      ) : (
        <>
          <AnimalTable animales={filtered} onDeleteRequest={setAnimalAEliminar} />
          <AnimalMobileList
            animales={filtered}
            onDeleteRequest={setAnimalAEliminar}
          />
        </>
      )}

      <DeleteAnimalDialog
        animal={animalAEliminar}
        open={animalAEliminar !== null}
        onOpenChange={(open) => {
          if (!open) setAnimalAEliminar(null);
        }}
        onDeleted={handleDeleted}
      />
    </div>
  );
}
