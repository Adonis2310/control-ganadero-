import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ClientExplorer } from "@/features/clientes/components/client-explorer";
import { createClient } from "@/lib/supabase/server";
import { clientesService } from "@/services/clientes.service";
import { ventasService } from "@/services/ventas.service";

export const metadata: Metadata = { title: "Clientes | Control Ganadero" };

export default async function ClientesPage() {
  const supabase = await createClient();
  const [clientes, ventas] = await Promise.all([clientesService.list(supabase), ventasService.list(supabase)]);

  const totalesPorCliente: Record<string, number> = {};
  for (const venta of ventas) {
    if (venta.estado !== "completada") continue;
    totalesPorCliente[venta.cliente_id] = (totalesPorCliente[venta.cliente_id] ?? 0) + venta.total;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Clientes</h1>
          <p className="text-sm text-muted-foreground">
            Administra los clientes de tu finca.
          </p>
        </div>
        <Button nativeButton={false} render={<Link href="/clientes/nuevo" />}>
          <Plus className="size-4" />
          Nuevo cliente
        </Button>
      </div>

      <ClientExplorer clientesIniciales={clientes} totalesPorCliente={totalesPorCliente} />
    </div>
  );
}
