import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { PurchaseForm } from "@/features/compras/components/purchase-form";
import { formatearNumeroCompra } from "@/features/compras/utils/compra.utils";
import { createClient } from "@/lib/supabase/server";
import { comprasService } from "@/services/compras.service";
import { productosInventarioService } from "@/services/productos-inventario.service";
import { proveedoresService } from "@/services/proveedores.service";

export const metadata: Metadata = { title: "Editar compra | Control Ganadero" };

interface EditarCompraPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditarCompraPage({ params }: EditarCompraPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const compra = await comprasService.getById(supabase, id);

  if (!compra) {
    notFound();
  }

  if (compra.estado !== "borrador" && compra.estado !== "pendiente") {
    redirect(`/compras/${id}`);
  }

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
        <h1 className="text-2xl font-semibold tracking-tight">
          Editar compra {formatearNumeroCompra(compra.numero)}
        </h1>
        <p className="text-sm text-muted-foreground">Actualiza la información de esta compra.</p>
      </div>

      <PurchaseForm mode="edit" proveedores={proveedores} productos={productosActivos} compra={compra} />
    </div>
  );
}
