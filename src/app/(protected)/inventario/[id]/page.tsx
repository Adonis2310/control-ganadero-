import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ProductDetailSection } from "@/features/inventario/components/product-detail-section";
import { createClient } from "@/lib/supabase/server";
import { movimientosInventarioService } from "@/services/movimientos-inventario.service";
import { productosInventarioService } from "@/services/productos-inventario.service";

interface ProductoDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ProductoDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const producto = await productosInventarioService.getById(supabase, id);
  return {
    title: producto ? `${producto.nombre} | Control Ganadero` : "Producto no encontrado | Control Ganadero",
  };
}

export default async function ProductoDetailPage({ params }: ProductoDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const producto = await productosInventarioService.getById(supabase, id);

  if (!producto) {
    notFound();
  }

  const movimientos = await movimientosInventarioService.listByProducto(supabase, producto.id);

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
        <h1 className="text-2xl font-semibold tracking-tight">{producto.nombre}</h1>
        <p className="text-sm text-muted-foreground">{producto.categoria?.nombre ?? "Sin categoría"}</p>
      </div>

      <ProductDetailSection productoInicial={producto} movimientosIniciales={movimientos} />
    </div>
  );
}
