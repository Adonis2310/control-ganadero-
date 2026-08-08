import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SupplierExplorer } from "@/features/proveedores/components/supplier-explorer";
import { createClient } from "@/lib/supabase/server";
import { proveedoresService } from "@/services/proveedores.service";

export const metadata: Metadata = { title: "Proveedores | Control Ganadero" };

export default async function ProveedoresPage() {
  const supabase = await createClient();
  const proveedores = await proveedoresService.list(supabase);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Proveedores</h1>
          <p className="text-sm text-muted-foreground">
            Administra los proveedores de insumos de tu finca.
          </p>
        </div>
        <Button nativeButton={false} render={<Link href="/proveedores/nuevo" />}>
          <Plus className="size-4" />
          Nuevo proveedor
        </Button>
      </div>

      <SupplierExplorer proveedoresIniciales={proveedores} />
    </div>
  );
}
