import type { Metadata } from "next";

import { ExpenseExplorer } from "@/features/finanzas/components/expense-explorer";
import { createClient } from "@/lib/supabase/server";
import { animalesService } from "@/services/animales.service";
import { categoriasGastosService } from "@/services/categorias-gastos.service";
import { fincaService } from "@/services/finca.service";
import { gastosService } from "@/services/gastos.service";
import { proveedoresService } from "@/services/proveedores.service";

export const metadata: Metadata = { title: "Gastos | Control Ganadero" };

export default async function GastosPage() {
  const supabase = await createClient();
  const finca = await fincaService.getOrCreate(supabase);

  const [gastos, categorias, proveedores, animales] = await Promise.all([
    gastosService.list(supabase),
    categoriasGastosService.listActivas(supabase),
    proveedoresService.listActivos(supabase),
    animalesService.listAll(supabase, finca.id),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Gastos</h1>
        <p className="text-sm text-muted-foreground">Registra y controla los gastos operativos de la finca.</p>
      </div>

      <ExpenseExplorer gastosIniciales={gastos} categorias={categorias} proveedores={proveedores} animales={animales} />
    </div>
  );
}
