"use client";

import Link from "next/link";
import { SearchX, Store } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SaleStatsCards } from "@/features/ventas/components/sale-stats";
import { SaleTable } from "@/features/ventas/components/sale-table";
import { SaleToolbar } from "@/features/ventas/components/sale-toolbar";
import { useVentaFilters } from "@/features/ventas/hooks/use-venta-filters";
import type { SalesStats, VentaConCliente } from "@/features/ventas/types";
import type { ClienteRef } from "@/features/clientes/types";

interface SaleExplorerProps {
  ventasIniciales: VentaConCliente[];
  clientes: ClienteRef[];
  stats: SalesStats;
  tiposPorVenta: Record<string, string[]>;
}

export function SaleExplorer({ ventasIniciales, clientes, stats, tiposPorVenta }: SaleExplorerProps) {
  const { filters, setFilters, filtered, hasActiveFilters, clearFilters } = useVentaFilters(
    ventasIniciales,
    tiposPorVenta,
  );

  if (ventasIniciales.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <SaleStatsCards stats={stats} />
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-20 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-muted">
            <Store className="size-6 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <p className="font-medium">Todavía no hay ventas registradas.</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Crea tu primera venta para empezar a llevar el control de tus operaciones comerciales.
            </p>
          </div>
          <Button nativeButton={false} render={<Link href="/ventas/nuevo" />}>
            + Crear primera venta
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <SaleStatsCards stats={stats} />

      <SaleToolbar
        filters={filters}
        onFiltersChange={setFilters}
        clientes={clientes}
        hasActiveFilters={hasActiveFilters}
        onClear={clearFilters}
      />

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-16 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-muted">
            <SearchX className="size-5 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <p className="font-medium">Ninguna venta coincide con la búsqueda</p>
            <p className="text-sm text-muted-foreground">Prueba ajustando los filtros o el término de búsqueda.</p>
          </div>
          <Button variant="outline" onClick={clearFilters}>
            Limpiar filtros
          </Button>
        </div>
      ) : (
        <SaleTable ventas={filtered} />
      )}
    </div>
  );
}
