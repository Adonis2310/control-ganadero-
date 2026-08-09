import type { Metadata } from "next";
import { Beef, Boxes, CalendarClock, DollarSign } from "lucide-react";

import { StatCard } from "@/features/dashboard/components/stat-card";
import { ChartPlaceholder } from "@/features/dashboard/components/chart-placeholder";
import type { StatCardData } from "@/features/dashboard/types";
import { AgendaDashboardWidget } from "@/features/calendario/components/agenda-dashboard-widget";
import type { ActividadAnimalRef } from "@/features/calendario/types";
import {
  calcularActividadStats,
  combinarEventos,
  construirEventosDesdeActividades,
  construirEventosReproduccion,
  construirEventosSalud,
} from "@/features/calendario/utils/actividad.utils";
import { ReproduccionDashboardAlerts } from "@/features/ganado/components/reproduccion-dashboard-alerts";
import { SaludDashboardAlerts } from "@/features/ganado/components/salud-dashboard-alerts";
import { construirDatosGenerales } from "@/features/ganado/utils/reproduccion.utils";
import { InventoryDashboardAlerts } from "@/features/inventario/components/inventory-dashboard-alerts";
import { calcularInventoryStats, formatearMoneda } from "@/features/inventario/utils/inventario.utils";
import { FinancialDashboardWidget } from "@/features/finanzas/components/financial-dashboard-widget";
import { ReportsQuickAccess } from "@/features/reportes/components/reports-quick-access";
import { calcularRangoPeriodo } from "@/features/finanzas/utils/periodo.utils";
import { calcularResumenFinanciero, construirUltimasOperaciones } from "@/features/finanzas/utils/finanzas.utils";
import { SalesDashboardWidget } from "@/features/ventas/components/sales-dashboard-widget";
import { calcularSalesStats } from "@/features/ventas/utils/venta.utils";
import { createClient } from "@/lib/supabase/server";
import { actividadesService } from "@/services/actividades.service";
import { animalesService } from "@/services/animales.service";
import { comprasService } from "@/services/compras.service";
import { desparasitacionesService } from "@/services/desparasitaciones.service";
import { eventosReproductivosService } from "@/services/eventos-reproductivos.service";
import { fincaService } from "@/services/finca.service";
import { gastosService } from "@/services/gastos.service";
import { gestacionesService } from "@/services/gestaciones.service";
import { productosInventarioService } from "@/services/productos-inventario.service";
import { saludService } from "@/services/salud.service";
import { vacunasService } from "@/services/vacunas.service";
import { ventasService } from "@/services/ventas.service";

export const metadata: Metadata = {
  title: "Dashboard | Control Ganadero",
};

const today = new Intl.DateTimeFormat("es-ES", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
}).format(new Date());

export default async function DashboardPage() {
  const formattedDate = today.charAt(0).toUpperCase() + today.slice(1);

  const supabase = await createClient();
  const finca = await fincaService.getOrCreate(supabase);
  const animales = await animalesService.listAllConSexo(supabase, finca.id);
  const animalIds = animales.map((a) => a.id);

  const [
    alertasSalud,
    gestaciones,
    eventosReproductivos,
    productosInventario,
    ventas,
    lineasVenta,
    compras,
    gastos,
    actividades,
    vacunas,
    desparasitaciones,
  ] = await Promise.all([
    saludService.getDashboardAlerts(supabase, finca.id),
    gestacionesService.listForFinca(supabase, animalIds),
    eventosReproductivosService.listForFinca(supabase, animalIds),
    productosInventarioService.list(supabase),
    ventasService.list(supabase),
    ventasService.listAllLineas(supabase),
    comprasService.list(supabase),
    gastosService.list(supabase),
    actividadesService.list(supabase, finca.id),
    vacunasService.listForFinca(supabase, animalIds),
    desparasitacionesService.listForFinca(supabase, animalIds),
  ]);
  const { stats: statsReproduccion } = construirDatosGenerales(animales, gestaciones, eventosReproductivos);
  const statsInventario = calcularInventoryStats(productosInventario);
  const statsVentas = calcularSalesStats(ventas, lineasVenta);
  const ultimasVentas = ventas.slice(0, 4);

  const rangoMes = calcularRangoPeriodo("mes");
  const resumenFinanciero = calcularResumenFinanciero(ventas, compras, gastos, rangoMes);
  const ultimasOperaciones = construirUltimasOperaciones(ventas, compras, gastos, 5);

  const animalPorId = new Map<string, ActividadAnimalRef>(
    animales.map((animal) => [animal.id, { ...animal, raza: null }]),
  );
  const statsAgenda = calcularActividadStats(actividades);
  const eventosAgenda = combinarEventos(
    construirEventosDesdeActividades(actividades),
    construirEventosSalud(vacunas, desparasitaciones, animalPorId),
    construirEventosReproduccion(gestaciones, animalPorId),
  );
  const proximaActividad =
    eventosAgenda.find((evento) => evento.fecha >= new Date().toISOString().split("T")[0] && evento.estado !== "cancelada") ??
    null;

  const STATS: StatCardData[] = [
    {
      label: "Total de animales",
      value: String(animales.length),
      change: "Sin datos aún",
      trend: "neutral",
      icon: Beef,
    },
    {
      label: "Ingresos del mes",
      value: formatearMoneda(statsVentas.ingresosDelMes),
      change: `${statsVentas.ventasDelMes} venta${statsVentas.ventasDelMes === 1 ? "" : "s"} este mes`,
      trend: "neutral",
      icon: DollarSign,
    },
    {
      label: "Ítems en inventario",
      value: String(statsInventario.totalProductos),
      change:
        statsInventario.stockBajo + statsInventario.agotados > 0
          ? `${statsInventario.stockBajo + statsInventario.agotados} con alerta de stock`
          : "Stock al día",
      trend: "neutral",
      icon: Boxes,
    },
    {
      label: "Eventos próximos",
      value: String(statsAgenda.pendientes),
      change:
        statsAgenda.vencidas > 0
          ? `${statsAgenda.vencidas} vencida${statsAgenda.vencidas === 1 ? "" : "s"}`
          : statsAgenda.hoy > 0
            ? `${statsAgenda.hoy} para hoy`
            : "Calendario al día",
      trend: statsAgenda.vencidas > 0 ? "down" : "neutral",
      icon: CalendarClock,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div className="flex items-center gap-3">
          {finca.logo_url && (
            // eslint-disable-next-line @next/next/no-img-element -- logo alojado en Supabase Storage, no un asset estático del sitio.
            <img src={finca.logo_url} alt={`Logo de ${finca.nombre}`} className="size-12 rounded-lg border object-cover" />
          )}
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{finca.nombre}</h1>
            <p className="text-sm text-muted-foreground">Panel de control ganadero</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">{formattedDate}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {STATS.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <ChartPlaceholder
          title="Producción mensual"
          description="Evolución de la producción a lo largo del año"
        />
        <AgendaDashboardWidget stats={statsAgenda} proxima={proximaActividad} />
        <SaludDashboardAlerts alertas={alertasSalud} />
        <ReproduccionDashboardAlerts stats={statsReproduccion} />
        <InventoryDashboardAlerts stats={statsInventario} />
        <SalesDashboardWidget stats={statsVentas} ultimasVentas={ultimasVentas} />
        <FinancialDashboardWidget summary={resumenFinanciero} ultimasOperaciones={ultimasOperaciones} />
        <ReportsQuickAccess />
      </div>
    </div>
  );
}
