import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { SaleForm } from "@/features/ventas/components/sale-form";
import { formatearNumeroVenta } from "@/features/ventas/utils/venta.utils";
import { createClient } from "@/lib/supabase/server";
import { animalesService } from "@/services/animales.service";
import { clientesService } from "@/services/clientes.service";
import { fincaService } from "@/services/finca.service";
import { productosInventarioService } from "@/services/productos-inventario.service";
import { ventasService } from "@/services/ventas.service";

export const metadata: Metadata = { title: "Editar venta | Control Ganadero" };

interface EditarVentaPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditarVentaPage({ params }: EditarVentaPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const venta = await ventasService.getById(supabase, id);

  if (!venta) {
    notFound();
  }

  if (venta.estado !== "borrador" && venta.estado !== "pendiente") {
    redirect(`/ventas/${id}`);
  }

  const finca = await fincaService.getOrCreate(supabase);
  const [clientes, animales, productos] = await Promise.all([
    clientesService.listActivos(supabase),
    animalesService.list(supabase, finca.id),
    productosInventarioService.list(supabase),
  ]);

  const animalesVendibles = animales
    .filter((animal) => animal.estado === "activo")
    .map((animal) => ({
      id: animal.id,
      identificador: animal.identificador,
      nombre: animal.nombre,
      sexo: animal.sexo,
      raza: animal.raza?.nombre ?? null,
      peso_actual_kg: animal.peso_actual_kg,
    }));

  const productosVendibles = productos
    .filter((producto) => producto.activo)
    .map((producto) => ({
      id: producto.id,
      nombre: producto.nombre,
      unidad_medida: producto.unidad_medida,
      stock_actual: producto.stock_actual,
    }));

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Editar venta {formatearNumeroVenta(venta.numero)}
        </h1>
        <p className="text-sm text-muted-foreground">Actualiza la información de esta venta.</p>
      </div>

      <SaleForm
        mode="edit"
        clientes={clientes}
        animales={animalesVendibles}
        productos={productosVendibles}
        venta={venta}
      />
    </div>
  );
}
