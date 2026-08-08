"use client";

import Link from "next/link";
import { SearchX, ShoppingCart } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PurchaseStatsCards } from "@/features/compras/components/purchase-stats";
import { PurchaseTable } from "@/features/compras/components/purchase-table";
import { PurchaseToolbar } from "@/features/compras/components/purchase-toolbar";
import { useCompraFilters } from "@/features/compras/hooks/use-compra-filters";
import type { CompraConProveedor, PurchaseStats } from "@/features/compras/types";
import type { ProveedorRef } from "@/features/proveedores/types";

interface PurchaseExplorerProps {
  comprasIniciales: CompraConProveedor[];
  proveedores: ProveedorRef[];
  stats: PurchaseStats;
}

export function PurchaseExplorer({ comprasIniciales, proveedores, stats }: PurchaseExplorerProps) {
  const { filters, setFilters, filtered, hasActiveFilters, clearFilters } = useCompraFilters(comprasIniciales);

  if (comprasIniciales.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <PurchaseStatsCards stats={stats} />
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-20 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-muted">
            <ShoppingCart className="size-6 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <p className="font-medium">Todavía no hay compras registradas.</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Crea tu primera compra para empezar a llevar el control de tus adquisiciones.
            </p>
          </div>
          <Button nativeButton={false} render={<Link href="/compras/nuevo" />}>
            + Crear primera compra
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PurchaseStatsCards stats={stats} />

      <PurchaseToolbar
        filters={filters}
        onFiltersChange={setFilters}
        proveedores={proveedores}
        hasActiveFilters={hasActiveFilters}
        onClear={clearFilters}
      />

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-16 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-muted">
            <SearchX className="size-5 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <p className="font-medium">Ninguna compra coincide con la búsqueda</p>
            <p className="text-sm text-muted-foreground">Prueba ajustando los filtros o el término de búsqueda.</p>
          </div>
          <Button variant="outline" onClick={clearFilters}>
            Limpiar filtros
          </Button>
        </div>
      ) : (
        <PurchaseTable compras={filtered} />
      )}
    </div>
  );
}
