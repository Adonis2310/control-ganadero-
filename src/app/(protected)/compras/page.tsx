import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PurchaseExplorer } from "@/features/compras/components/purchase-explorer";
import { calcularPurchaseStats } from "@/features/compras/utils/compra.utils";
import { createClient } from "@/lib/supabase/server";
import { comprasService } from "@/services/compras.service";
import { proveedoresService } from "@/services/proveedores.service";

export const metadata: Metadata = { title: "Compras | Control Ganadero" };

export default async function ComprasPage() {
  const supabase = await createClient();
  const [compras, proveedores] = await Promise.all([
    comprasService.list(supabase),
    proveedoresService.listActivos(supabase),
  ]);

  const stats = calcularPurchaseStats(compras);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Compras</h1>
          <p className="text-sm text-muted-foreground">
            Registra y controla las compras de insumos de tu finca.
          </p>
        </div>
        <Button nativeButton={false} render={<Link href="/compras/nuevo" />}>
          <Plus className="size-4" />
          Nueva compra
        </Button>
      </div>

      <PurchaseExplorer comprasIniciales={compras} proveedores={proveedores} stats={stats} />
    </div>
  );
}
