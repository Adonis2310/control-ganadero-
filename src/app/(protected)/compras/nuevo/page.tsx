import type { Metadata } from "next";

import { PurchaseForm } from "@/features/compras/components/purchase-form";
import { createClient } from "@/lib/supabase/server";
import { productosInventarioService } from "@/services/productos-inventario.service";
import { proveedoresService } from "@/services/proveedores.service";

export const metadata: Metadata = { title: "Nueva compra | Control Ganadero" };

export default async function NuevaCompraPage() {
  const supabase = await createClient();
  const [proveedores, productos] = await Promise.all([
    proveedoresService.listActivos(supabase),
    productosInventarioService.list(supabase),
  ]);

  const productosActivos = productos
    .filter((producto) => producto.activo)
    .map((producto) => ({ id: producto.id, nombre: producto.nombre, unidad_medida: producto.unidad_medida }));

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Nueva compra</h1>
        <p className="text-sm text-muted-foreground">
          Registra una nueva compra de productos para tu finca.
        </p>
      </div>

      <PurchaseForm mode="create" proveedores={proveedores} productos={productosActivos} />
    </div>
  );
}
