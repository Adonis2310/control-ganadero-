import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { MovementsExplorer } from "@/features/inventario/components/movements-explorer";
import { createClient } from "@/lib/supabase/server";
import { categoriasInventarioService } from "@/services/categorias-inventario.service";
import { movimientosInventarioService } from "@/services/movimientos-inventario.service";
import { productosInventarioService } from "@/services/productos-inventario.service";

export const metadata: Metadata = { title: "Movimientos de inventario | Control Ganadero" };

export default async function MovimientosInventarioPage() {
  const supabase = await createClient();
  const [movimientos, productos, categorias] = await Promise.all([
    movimientosInventarioService.listAll(supabase),
    productosInventarioService.list(supabase),
    categoriasInventarioService.list(supabase),
  ]);

  const productosRef = productos.map((p) => ({
    id: p.id,
    nombre: p.nombre,
    unidad_medida: p.unidad_medida,
    categoria_id: p.categoria_id,
  }));

  return (
    <div className="flex flex-col gap-6">
      <Button
        variant="ghost"
        size="sm"
        nativeButton={false}
        render={<Link href="/inventario" />}
        className="w-fit text-muted-foreground"
      >
        <ArrowLeft className="size-4" />
        Volver a Inventario
      </Button>

      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Movimientos</h1>
        <p className="text-sm text-muted-foreground">
          Consulta el historial de entradas, salidas y ajustes de todo el inventario.
        </p>
      </div>

      <MovementsExplorer movimientosIniciales={movimientos} productos={productosRef} categorias={categorias} />
    </div>
  );
}
