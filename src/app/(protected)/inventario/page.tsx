import type { Metadata } from "next";
import Link from "next/link";
import { ClipboardList, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ProductExplorer } from "@/features/inventario/components/product-explorer";
import { calcularInventoryStats } from "@/features/inventario/utils/inventario.utils";
import { createClient } from "@/lib/supabase/server";
import { categoriasInventarioService } from "@/services/categorias-inventario.service";
import { productosInventarioService } from "@/services/productos-inventario.service";

export const metadata: Metadata = { title: "Inventario | Control Ganadero" };

export default async function InventarioPage() {
  const supabase = await createClient();
  const [productos, categorias] = await Promise.all([
    productosInventarioService.list(supabase),
    categoriasInventarioService.list(supabase),
  ]);

  const stats = calcularInventoryStats(productos);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Inventario</h1>
          <p className="text-sm text-muted-foreground">
            Controla los productos e insumos disponibles en tu finca.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" nativeButton={false} render={<Link href="/inventario/movimientos" />}>
            <ClipboardList className="size-4" />
            Movimientos
          </Button>
          <Button nativeButton={false} render={<Link href="/inventario/nuevo" />}>
            <Plus className="size-4" />
            Nuevo producto
          </Button>
        </div>
      </div>

      <ProductExplorer productosIniciales={productos} categorias={categorias} stats={stats} />
    </div>
  );
}
