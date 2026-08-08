"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SearchX } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { DeactivateProductDialog } from "@/features/inventario/components/deactivate-product-dialog";
import { InventoryAlerts } from "@/features/inventario/components/inventory-alerts";
import { InventoryEmptyState } from "@/features/inventario/components/inventory-empty-state";
import { InventoryStatsCards } from "@/features/inventario/components/inventory-stats";
import { ProductTable } from "@/features/inventario/components/product-table";
import { ProductToolbar } from "@/features/inventario/components/product-toolbar";
import { useProductoFilters } from "@/features/inventario/hooks/use-producto-filters";
import type { CategoriaInventario, InventoryStats, ProductoInventario } from "@/features/inventario/types";
import { construirAlertasInventario } from "@/features/inventario/utils/inventario.utils";
import { createClient } from "@/lib/supabase/client";
import { productosInventarioService } from "@/services/productos-inventario.service";

interface ProductExplorerProps {
  productosIniciales: ProductoInventario[];
  categorias: CategoriaInventario[];
  stats: InventoryStats;
}

export function ProductExplorer({ productosIniciales, categorias, stats }: ProductExplorerProps) {
  const router = useRouter();
  const [productos, setProductos] = useState(productosIniciales);
  const [productoADesactivar, setProductoADesactivar] = useState<ProductoInventario | null>(null);

  const { filters, setFilters, filtered, hasActiveFilters, clearFilters } = useProductoFilters(productos);
  const alertas = construirAlertasInventario(productos);

  async function handleToggleActivo(producto: ProductoInventario) {
    if (producto.activo) {
      setProductoADesactivar(producto);
      return;
    }
    try {
      const supabase = createClient();
      await productosInventarioService.setActivo(supabase, producto.id, true);
      setProductos((prev) => prev.map((p) => (p.id === producto.id ? { ...p, activo: true } : p)));
      toast.success("Producto activado");
      router.refresh();
    } catch {
      toast.error("No se pudo activar el producto");
    }
  }

  function handleDeactivated(id: string) {
    setProductos((prev) => prev.map((p) => (p.id === id ? { ...p, activo: false } : p)));
    router.refresh();
  }

  if (productosIniciales.length === 0) {
    return <InventoryEmptyState />;
  }

  return (
    <div className="flex flex-col gap-6">
      <InventoryStatsCards stats={stats} />
      <InventoryAlerts alertas={alertas} />

      <ProductToolbar
        filters={filters}
        onFiltersChange={setFilters}
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
            <p className="font-medium">Ningún producto coincide con la búsqueda</p>
            <p className="text-sm text-muted-foreground">Prueba ajustando los filtros o el término de búsqueda.</p>
          </div>
          <Button variant="outline" onClick={clearFilters}>
            Limpiar filtros
          </Button>
        </div>
      ) : (
        <ProductTable productos={filtered} onToggleActivo={handleToggleActivo} />
      )}

      <DeactivateProductDialog
        producto={productoADesactivar}
        open={productoADesactivar !== null}
        onOpenChange={(open) => !open && setProductoADesactivar(null)}
        onDeactivated={handleDeactivated}
      />
    </div>
  );
}
