"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SearchX, Truck } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { DeactivateSupplierDialog } from "@/features/proveedores/components/deactivate-supplier-dialog";
import { SupplierTable } from "@/features/proveedores/components/supplier-table";
import { SupplierToolbar } from "@/features/proveedores/components/supplier-toolbar";
import { useProveedorFilters } from "@/features/proveedores/hooks/use-proveedor-filters";
import type { ProveedorRow } from "@/features/proveedores/types";
import { createClient } from "@/lib/supabase/client";
import { proveedoresService } from "@/services/proveedores.service";

export function SupplierExplorer({ proveedoresIniciales }: { proveedoresIniciales: ProveedorRow[] }) {
  const router = useRouter();
  const [proveedores, setProveedores] = useState(proveedoresIniciales);
  const [proveedorADesactivar, setProveedorADesactivar] = useState<ProveedorRow | null>(null);

  const { filters, setFilters, filtered, hasActiveFilters, clearFilters } = useProveedorFilters(proveedores);

  async function handleToggleActivo(proveedor: ProveedorRow) {
    if (proveedor.activo) {
      setProveedorADesactivar(proveedor);
      return;
    }
    try {
      const supabase = createClient();
      await proveedoresService.setActivo(supabase, proveedor.id, true);
      setProveedores((prev) => prev.map((p) => (p.id === proveedor.id ? { ...p, activo: true } : p)));
      toast.success("Proveedor activado");
      router.refresh();
    } catch {
      toast.error("No se pudo activar el proveedor");
    }
  }

  function handleDeactivated(id: string) {
    setProveedores((prev) => prev.map((p) => (p.id === id ? { ...p, activo: false } : p)));
    router.refresh();
  }

  if (proveedoresIniciales.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-20 text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-muted">
          <Truck className="size-6 text-muted-foreground" />
        </div>
        <div className="space-y-1">
          <p className="font-medium">No hay proveedores registrados.</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Registra tu primer proveedor para empezar a llevar el control de tus compras.
          </p>
        </div>
        <Button nativeButton={false} render={<Link href="/proveedores/nuevo" />}>
          + Agregar proveedor
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <SupplierToolbar
        filters={filters}
        onFiltersChange={setFilters}
        hasActiveFilters={hasActiveFilters}
        onClear={clearFilters}
      />

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-16 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-muted">
            <SearchX className="size-5 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <p className="font-medium">Ningún proveedor coincide con la búsqueda</p>
            <p className="text-sm text-muted-foreground">Prueba ajustando los filtros o el término de búsqueda.</p>
          </div>
          <Button variant="outline" onClick={clearFilters}>
            Limpiar filtros
          </Button>
        </div>
      ) : (
        <SupplierTable proveedores={filtered} onToggleActivo={handleToggleActivo} />
      )}

      <DeactivateSupplierDialog
        proveedor={proveedorADesactivar}
        open={proveedorADesactivar !== null}
        onOpenChange={(open) => !open && setProveedorADesactivar(null)}
        onDeactivated={handleDeactivated}
      />
    </div>
  );
}
