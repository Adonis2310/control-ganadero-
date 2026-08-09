import type { Metadata } from "next";

import { ReportsDashboard } from "@/features/reportes/components/reports-dashboard";
import { createClient } from "@/lib/supabase/server";
import { actividadesService } from "@/services/actividades.service";
import { animalesService } from "@/services/animales.service";
import { categoriasGastosService } from "@/services/categorias-gastos.service";
import { comprasService } from "@/services/compras.service";
import { eventosReproductivosService } from "@/services/eventos-reproductivos.service";
import { fincaService } from "@/services/finca.service";
import { gastosService } from "@/services/gastos.service";
import { gestacionesService } from "@/services/gestaciones.service";
import { movimientosInventarioService } from "@/services/movimientos-inventario.service";
import { pesosService } from "@/services/pesos.service";
import { productosInventarioService } from "@/services/productos-inventario.service";
import { saludService } from "@/services/salud.service";
import { ventasService } from "@/services/ventas.service";

export const metadata: Metadata = { title: "Reportes | Control Ganadero" };

export default async function ReportesPage() {
  const supabase = await createClient();
  const finca = await fincaService.getOrCreate(supabase);

  const animales = await animalesService.list(supabase, finca.id);
  const animalIds = animales.map((animal) => animal.id);

  const [
    pesos,
    registrosSalud,
    gestaciones,
    eventosReproductivos,
    productosInventario,
    movimientosInventario,
    compras,
    ventas,
    lineasVenta,
    gastos,
    categoriasGastos,
    actividades,
  ] = await Promise.all([
    pesosService.listForFinca(supabase, finca.id),
    saludService.listRegistrosFinca(supabase, finca.id),
    gestacionesService.listForFinca(supabase, animalIds),
    eventosReproductivosService.listForFinca(supabase, animalIds),
    productosInventarioService.list(supabase),
    movimientosInventarioService.listAll(supabase),
    comprasService.list(supabase),
    ventasService.list(supabase),
    ventasService.listAllLineas(supabase),
    gastosService.list(supabase),
    categoriasGastosService.list(supabase),
    actividadesService.list(supabase, finca.id),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Reportes y análisis</h1>
        <p className="text-sm text-muted-foreground">Consulta el comportamiento y rendimiento de {finca.nombre}.</p>
      </div>

      <ReportsDashboard
        animales={animales}
        pesos={pesos}
        registrosSalud={registrosSalud}
        gestaciones={gestaciones}
        eventosReproductivos={eventosReproductivos}
        productosInventario={productosInventario}
        movimientosInventario={movimientosInventario}
        compras={compras}
        ventas={ventas}
        lineasVenta={lineasVenta}
        gastos={gastos}
        categoriasGastos={categoriasGastos}
        actividades={actividades}
      />
    </div>
  );
}
