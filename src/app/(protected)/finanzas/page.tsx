import type { Metadata } from "next";

import { FinanzasDashboard } from "@/features/finanzas/components/finanzas-dashboard";
import { createClient } from "@/lib/supabase/server";
import { categoriasGastosService } from "@/services/categorias-gastos.service";
import { comprasService } from "@/services/compras.service";
import { gastosService } from "@/services/gastos.service";
import { ventasService } from "@/services/ventas.service";

export const metadata: Metadata = { title: "Finanzas | Control Ganadero" };

export default async function FinanzasPage() {
  const supabase = await createClient();

  const [ventas, compras, gastos, categorias, lineasVenta] = await Promise.all([
    ventasService.list(supabase),
    comprasService.list(supabase),
    gastosService.list(supabase),
    categoriasGastosService.list(supabase),
    ventasService.listAllLineas(supabase),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Finanzas</h1>
        <p className="text-sm text-muted-foreground">
          Consulta los ingresos, egresos y movimientos económicos de tu finca.
        </p>
      </div>

      <FinanzasDashboard
        ventas={ventas}
        compras={compras}
        gastos={gastos}
        categorias={categorias}
        lineasVenta={lineasVenta}
      />
    </div>
  );
}
