"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowDownToLine, ArrowUpFromLine, Pencil, Power, PowerOff, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { DeactivateProductDialog } from "@/features/inventario/components/deactivate-product-dialog";
import { InventoryMovementFormDialog } from "@/features/inventario/components/inventory-movement-form-dialog";
import { MovementTable } from "@/features/inventario/components/movement-table";
import { ProductDetails } from "@/features/inventario/components/product-details";
import { ProductPurchaseHistory } from "@/features/inventario/components/product-purchase-history";
import { ProductSaleHistory } from "@/features/inventario/components/product-sale-history";
import type { MovimientoInventarioRow, ProductoInventario, TipoMovimiento } from "@/features/inventario/types";
import type { DetalleCompraConCompra } from "@/features/compras/types";
import type { DetalleVentaConVenta } from "@/features/ventas/types";
import { createClient } from "@/lib/supabase/client";
import { movimientosInventarioService } from "@/services/movimientos-inventario.service";
import { productosInventarioService } from "@/services/productos-inventario.service";

interface ProductDetailSectionProps {
  productoInicial: ProductoInventario;
  movimientosIniciales: MovimientoInventarioRow[];
  comprasIniciales: DetalleCompraConCompra[];
  ventasIniciales: DetalleVentaConVenta[];
}

export function ProductDetailSection({
  productoInicial,
  movimientosIniciales,
  comprasIniciales,
  ventasIniciales,
}: ProductDetailSectionProps) {
  const router = useRouter();
  const [producto, setProducto] = useState(productoInicial);
  const [movimientos, setMovimientos] = useState(movimientosIniciales);
  const [movimientoAbierto, setMovimientoAbierto] = useState<TipoMovimiento | null>(null);
  const [desactivarAbierto, setDesactivarAbierto] = useState(false);

  async function recargar() {
    const supabase = createClient();
    const [nuevoProducto, nuevosMovimientos] = await Promise.all([
      productosInventarioService.getById(supabase, producto.id),
      movimientosInventarioService.listByProducto(supabase, producto.id),
    ]);
    if (nuevoProducto) setProducto(nuevoProducto);
    setMovimientos(nuevosMovimientos);
    router.refresh();
  }

  async function handleActivar() {
    try {
      const supabase = createClient();
      await productosInventarioService.setActivo(supabase, producto.id, true);
      setProducto((prev) => ({ ...prev, activo: true }));
      toast.success("Producto activado");
      router.refresh();
    } catch {
      toast.error("No se pudo activar el producto");
    }
  }

  const movimientosConProducto = movimientos.map((m) => ({
    ...m,
    producto: {
      id: producto.id,
      nombre: producto.nombre,
      unidad_medida: producto.unidad_medida,
      categoria_id: producto.categoria_id,
    },
  }));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" nativeButton={false} render={<Link href={`/inventario/${producto.id}/editar`} />}>
          <Pencil className="size-4" />
          Editar
        </Button>
        <Button variant="outline" size="sm" onClick={() => setMovimientoAbierto("entrada")}>
          <ArrowDownToLine className="size-4" />
          Registrar entrada
        </Button>
        <Button variant="outline" size="sm" onClick={() => setMovimientoAbierto("salida")}>
          <ArrowUpFromLine className="size-4" />
          Registrar salida
        </Button>
        <Button variant="outline" size="sm" onClick={() => setMovimientoAbierto("ajuste")}>
          <SlidersHorizontal className="size-4" />
          Ajustar stock
        </Button>
        {producto.activo ? (
          <Button variant="outline" size="sm" onClick={() => setDesactivarAbierto(true)}>
            <PowerOff className="size-4" />
            Desactivar
          </Button>
        ) : (
          <Button variant="outline" size="sm" onClick={handleActivar}>
            <Power className="size-4" />
            Activar
          </Button>
        )}
      </div>

      <ProductDetails producto={producto} />

      <div className="flex flex-col gap-3">
        <h4 className="text-sm font-medium text-muted-foreground">Movimientos</h4>
        {movimientos.length === 0 ? (
          <p className="rounded-xl border border-dashed py-12 text-center text-sm text-muted-foreground">
            Todavía no hay movimientos registrados.
          </p>
        ) : (
          <MovementTable movimientos={movimientosConProducto} unidadMedida={producto.unidad_medida} />
        )}
      </div>

      <ProductPurchaseHistory compras={comprasIniciales} />

      <ProductSaleHistory ventas={ventasIniciales} />

      {movimientoAbierto && (
        <InventoryMovementFormDialog
          producto={producto}
          tipo={movimientoAbierto}
          open={movimientoAbierto !== null}
          onOpenChange={(open) => !open && setMovimientoAbierto(null)}
          onSaved={recargar}
        />
      )}

      <DeactivateProductDialog
        producto={desactivarAbierto ? producto : null}
        open={desactivarAbierto}
        onOpenChange={setDesactivarAbierto}
        onDeactivated={() => {
          setProducto((prev) => ({ ...prev, activo: false }));
          router.refresh();
        }}
      />
    </div>
  );
}
