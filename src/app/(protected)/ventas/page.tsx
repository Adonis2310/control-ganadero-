import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SaleExplorer } from "@/features/ventas/components/sale-explorer";
import { calcularSalesStats } from "@/features/ventas/utils/venta.utils";
import { createClient } from "@/lib/supabase/server";
import { clientesService } from "@/services/clientes.service";
import { ventasService } from "@/services/ventas.service";

export const metadata: Metadata = { title: "Ventas | Control Ganadero" };

export default async function VentasPage() {
  const supabase = await createClient();
  const [ventas, clientes, lineas] = await Promise.all([
    ventasService.list(supabase),
    clientesService.listActivos(supabase),
    ventasService.listAllLineas(supabase),
  ]);

  const stats = calcularSalesStats(ventas, lineas);

  const tiposPorVenta: Record<string, string[]> = {};
  for (const linea of lineas) {
    const tipos = tiposPorVenta[linea.venta_id] ?? [];
    if (!tipos.includes(linea.tipo)) tipos.push(linea.tipo);
    tiposPorVenta[linea.venta_id] = tipos;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Ventas</h1>
          <p className="text-sm text-muted-foreground">
            Registra y controla las ventas de animales y productos de tu finca.
          </p>
        </div>
        <Button nativeButton={false} render={<Link href="/ventas/nuevo" />}>
          <Plus className="size-4" />
          Nueva venta
        </Button>
      </div>

      <SaleExplorer ventasIniciales={ventas} clientes={clientes} stats={stats} tiposPorVenta={tiposPorVenta} />
    </div>
  );
}
