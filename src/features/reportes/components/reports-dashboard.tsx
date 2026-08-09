"use client";

import { useMemo } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ActividadConAnimal } from "@/features/calendario/types";
import { PERIODO_OPTIONS, type CategoriaGastoRow, type GastoConReferencias } from "@/features/finanzas/types";
import { calcularResumenFinanciero, calcularSerieMensual } from "@/features/finanzas/utils/finanzas.utils";
import { enumerarMeses } from "@/features/finanzas/utils/periodo.utils";
import { useFinancialPeriod } from "@/features/finanzas/hooks/use-financial-period";
import type { CompraConProveedor } from "@/features/compras/types";
import type { Animal, AnimalRef, EventoReproductivoRow, GestacionRow, PesoConAnimal, RegistroSalud, SexoAnimal } from "@/features/ganado/types";
import type { ProductoInventario, MovimientoConProducto } from "@/features/inventario/types";
import type { DetalleVentaRow, VentaConCliente } from "@/features/ventas/types";
import { ActivitiesReport } from "@/features/reportes/components/activities-report";
import { ExpensesReport } from "@/features/reportes/components/expenses-report";
import { FinancialReport } from "@/features/reportes/components/financial-report";
import { HealthReport } from "@/features/reportes/components/health-report";
import { InventoryReport } from "@/features/reportes/components/inventory-report";
import { LivestockReport } from "@/features/reportes/components/livestock-report";
import { PurchasesReport } from "@/features/reportes/components/purchases-report";
import { ReportPeriodFilter } from "@/features/reportes/components/report-period-filter";
import { ReportSummaryCards } from "@/features/reportes/components/report-summary-cards";
import { ReproductionReport } from "@/features/reportes/components/reproduction-report";
import { SalesReport } from "@/features/reportes/components/sales-report";
import { WeightReport } from "@/features/reportes/components/weight-report";
import { calcularResumenGeneral } from "@/features/reportes/utils/reportes.utils";
import type { ActividadRow } from "@/features/calendario/types";

interface ReportsDashboardProps {
  animales: Animal[];
  pesos: PesoConAnimal[];
  registrosSalud: RegistroSalud[];
  gestaciones: GestacionRow[];
  eventosReproductivos: EventoReproductivoRow[];
  productosInventario: ProductoInventario[];
  movimientosInventario: MovimientoConProducto[];
  compras: CompraConProveedor[];
  ventas: VentaConCliente[];
  lineasVenta: Pick<DetalleVentaRow, "venta_id" | "tipo">[];
  gastos: GastoConReferencias[];
  categoriasGastos: CategoriaGastoRow[];
  actividades: ActividadConAnimal[];
}

export function ReportsDashboard({
  animales,
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
}: ReportsDashboardProps) {
  const { periodo, setPeriodo, personalizado, setPersonalizado, rango } = useFinancialPeriod();

  const periodoLabel = useMemo(() => {
    const etiqueta = PERIODO_OPTIONS.find((option) => option.value === periodo)?.label ?? "Este mes";
    return `${etiqueta} (${rango.desde} a ${rango.hasta})`;
  }, [periodo, rango]);

  const meses = useMemo(() => enumerarMeses(rango), [rango]);
  const serieMensual = useMemo(() => calcularSerieMensual(ventas, compras, gastos, rango), [ventas, compras, gastos, rango]);
  const resumenFinanciero = useMemo(() => calcularResumenFinanciero(ventas, compras, gastos, rango), [ventas, compras, gastos, rango]);

  const resumen = useMemo(
    () => calcularResumenGeneral(animales, ventas, lineasVenta, compras, gastos, rango),
    [animales, ventas, lineasVenta, compras, gastos, rango],
  );

  const animalesRef: AnimalRef[] = useMemo(
    () => animales.map((a) => ({ id: a.id, identificador: a.identificador, nombre: a.nombre })),
    [animales],
  );
  const animalesConSexo: (AnimalRef & { sexo: SexoAnimal })[] = useMemo(
    () => animales.map((a) => ({ id: a.id, identificador: a.identificador, nombre: a.nombre, sexo: a.sexo })),
    [animales],
  );
  const actividadesRow: ActividadRow[] = actividades;

  return (
    <div className="flex flex-col gap-6">
      {/* Encabezado de impresión: sección 18, solo visible al imprimir (sidebar/navbar/filtros/botones se ocultan con print:hidden). */}
      <div className="hidden print:block">
        <p className="text-sm text-muted-foreground">Período: {periodoLabel}</p>
        <p className="text-sm text-muted-foreground">Generado: {new Date().toLocaleString("es")}</p>
      </div>

      <div className="print:hidden">
        <ReportPeriodFilter
          periodo={periodo}
          onPeriodoChange={setPeriodo}
          personalizado={personalizado}
          onPersonalizadoChange={setPersonalizado}
        />
      </div>

      <ReportSummaryCards resumen={resumen} />

      <Tabs defaultValue="ganado">
        <div className="overflow-x-auto pb-1 print:hidden">
          <TabsList>
            <TabsTrigger value="ganado">Ganado</TabsTrigger>
            <TabsTrigger value="peso">Peso</TabsTrigger>
            <TabsTrigger value="salud">Salud</TabsTrigger>
            <TabsTrigger value="reproduccion">Reproducción</TabsTrigger>
            <TabsTrigger value="inventario">Inventario</TabsTrigger>
            <TabsTrigger value="compras">Compras</TabsTrigger>
            <TabsTrigger value="ventas">Ventas</TabsTrigger>
            <TabsTrigger value="gastos">Gastos</TabsTrigger>
            <TabsTrigger value="finanzas">Finanzas</TabsTrigger>
            <TabsTrigger value="actividades">Actividades</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="ganado" className="pt-4">
          <LivestockReport animales={animales} rango={rango} periodoLabel={periodoLabel} />
        </TabsContent>
        <TabsContent value="peso" className="pt-4">
          <WeightReport pesos={pesos} animales={animalesRef} rango={rango} periodoLabel={periodoLabel} />
        </TabsContent>
        <TabsContent value="salud" className="pt-4">
          <HealthReport registros={registrosSalud} actividades={actividadesRow} rango={rango} periodoLabel={periodoLabel} />
        </TabsContent>
        <TabsContent value="reproduccion" className="pt-4">
          <ReproductionReport
            animales={animalesConSexo}
            gestaciones={gestaciones}
            eventos={eventosReproductivos}
            rango={rango}
            periodoLabel={periodoLabel}
          />
        </TabsContent>
        <TabsContent value="inventario" className="pt-4">
          <InventoryReport
            productos={productosInventario}
            movimientos={movimientosInventario}
            meses={meses}
            rango={rango}
            periodoLabel={periodoLabel}
          />
        </TabsContent>
        <TabsContent value="compras" className="pt-4">
          <PurchasesReport compras={compras} serieMensual={serieMensual} rango={rango} periodoLabel={periodoLabel} />
        </TabsContent>
        <TabsContent value="ventas" className="pt-4">
          <SalesReport ventas={ventas} lineas={lineasVenta} serieMensual={serieMensual} rango={rango} periodoLabel={periodoLabel} />
        </TabsContent>
        <TabsContent value="gastos" className="pt-4">
          <ExpensesReport gastos={gastos} categorias={categoriasGastos} serieMensual={serieMensual} rango={rango} periodoLabel={periodoLabel} />
        </TabsContent>
        <TabsContent value="finanzas" className="pt-4">
          <FinancialReport summary={resumenFinanciero} serieMensual={serieMensual} periodoLabel={periodoLabel} />
        </TabsContent>
        <TabsContent value="actividades" className="pt-4">
          <ActivitiesReport actividades={actividades} rango={rango} periodoLabel={periodoLabel} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
