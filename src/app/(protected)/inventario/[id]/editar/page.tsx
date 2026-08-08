import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProductForm } from "@/features/inventario/components/product-form";
import { createClient } from "@/lib/supabase/server";
import { categoriasInventarioService } from "@/services/categorias-inventario.service";
import { productosInventarioService } from "@/services/productos-inventario.service";

export const metadata: Metadata = { title: "Editar producto | Control Ganadero" };

interface EditarProductoPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditarProductoPage({ params }: EditarProductoPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const [producto, categorias] = await Promise.all([
    productosInventarioService.getById(supabase, id),
    categoriasInventarioService.list(supabase),
  ]);

  if (!producto) {
    notFound();
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Editar {producto.nombre}</h1>
        <p className="text-sm text-muted-foreground">Actualiza la información del producto.</p>
      </div>

      <ProductForm mode="edit" categorias={categorias} producto={producto} />
    </div>
  );
}
