import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SupplierForm } from "@/features/proveedores/components/supplier-form";
import { createClient } from "@/lib/supabase/server";
import { proveedoresService } from "@/services/proveedores.service";

export const metadata: Metadata = { title: "Editar proveedor | Control Ganadero" };

interface EditarProveedorPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditarProveedorPage({ params }: EditarProveedorPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const proveedor = await proveedoresService.getById(supabase, id);

  if (!proveedor) {
    notFound();
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Editar {proveedor.nombre}</h1>
        <p className="text-sm text-muted-foreground">Actualiza la información del proveedor.</p>
      </div>

      <SupplierForm mode="edit" proveedor={proveedor} />
    </div>
  );
}
