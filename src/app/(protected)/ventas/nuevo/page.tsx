import type { Metadata } from "next";

import { SaleForm } from "@/features/ventas/components/sale-form";
import { createClient } from "@/lib/supabase/server";
import { animalesService } from "@/services/animales.service";
import { clientesService } from "@/services/clientes.service";
import { fincaService } from "@/services/finca.service";
import { productosInventarioService } from "@/services/productos-inventario.service";

export const metadata: Metadata = { title: "Nueva venta | Control Ganadero" };

export default async function NuevaVentaPage() {
  const supabase = await createClient();
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
        <h1 className="text-2xl font-semibold tracking-tight">Nueva venta</h1>
        <p className="text-sm text-muted-foreground">
          Registra la venta de animales, productos u otros elementos.
        </p>
      </div>

      <SaleForm mode="create" clientes={clientes} animales={animalesVendibles} productos={productosVendibles} />
    </div>
  );
}
