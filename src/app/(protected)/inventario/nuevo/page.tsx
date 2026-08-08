import type { Metadata } from "next";

import { ProductForm } from "@/features/inventario/components/product-form";
import { createClient } from "@/lib/supabase/server";
import { categoriasInventarioService } from "@/services/categorias-inventario.service";

export const metadata: Metadata = { title: "Nuevo producto | Control Ganadero" };

export default async function NuevoProductoPage() {
  const supabase = await createClient();
  const categorias = await categoriasInventarioService.list(supabase);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Nuevo producto</h1>
        <p className="text-sm text-muted-foreground">
          Registra un nuevo producto en el inventario de tu finca.
        </p>
      </div>

      <ProductForm mode="create" categorias={categorias} />
    </div>
  );
}
