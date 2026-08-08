import type { Metadata } from "next";

import { SupplierForm } from "@/features/proveedores/components/supplier-form";

export const metadata: Metadata = { title: "Nuevo proveedor | Control Ganadero" };

export default function NuevoProveedorPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Nuevo proveedor</h1>
        <p className="text-sm text-muted-foreground">Registra un nuevo proveedor de tu finca.</p>
      </div>

      <SupplierForm mode="create" />
    </div>
  );
}
