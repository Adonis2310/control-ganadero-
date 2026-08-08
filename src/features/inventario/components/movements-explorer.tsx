"use client";

import { PackageSearch, SearchX } from "lucide-react";

import { Button } from "@/components/ui/button";
import { MovementTable } from "@/features/inventario/components/movement-table";
import { MovementToolbar } from "@/features/inventario/components/movement-toolbar";
import { useMovimientoFilters } from "@/features/inventario/hooks/use-movimiento-filters";
import type { CategoriaInventario, MovimientoConProducto, ProductoRef } from "@/features/inventario/types";

interface MovementsExplorerProps {
  movimientosIniciales: MovimientoConProducto[];
  productos: ProductoRef[];
  categorias: CategoriaInventario[];
}

export function MovementsExplorer({ movimientosIniciales, productos, categorias }: MovementsExplorerProps) {
  const { filters, setFilters, filtered, hasActiveFilters, clearFilters } = useMovimientoFilters(movimientosIniciales);

  if (movimientosIniciales.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-20 text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-muted">
          <PackageSearch className="size-6 text-muted-foreground" />
        </div>
        <div className="space-y-1">
          <p className="font-medium">Todavía no hay movimientos registrados.</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Registra una entrada, salida o ajuste desde la ficha de un producto para verlo aquí.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <MovementToolbar
        filters={filters}
        onFiltersChange={setFilters}
        productos={productos}
        categorias={categorias}
        hasActiveFilters={hasActiveFilters}
        onClear={clearFilters}
      />

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-16 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-muted">
            <SearchX className="size-5 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <p className="font-medium">Ningún movimiento coincide con la búsqueda</p>
            <p className="text-sm text-muted-foreground">Prueba ajustando los filtros o el término de búsqueda.</p>
          </div>
          <Button variant="outline" onClick={clearFilters}>
            Limpiar filtros
          </Button>
        </div>
      ) : (
        <MovementTable movimientos={filtered} mostrarProducto />
      )}
    </div>
  );
}
