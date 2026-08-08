"use client";

import { useMemo } from "react";

import { FinancialAlerts } from "@/features/finanzas/components/financial-alerts";
import { FinancialPeriodFilter } from "@/features/finanzas/components/financial-period-filter";
import { FinancialSummary } from "@/features/finanzas/components/financial-summary";
import { ExpenseCategoryChart } from "@/features/finanzas/components/expense-category-chart";
import { IncomeExpenseChart } from "@/features/finanzas/components/income-expense-chart";
import { IncomeTypeChart } from "@/features/finanzas/components/income-type-chart";
import { useFinancialPeriod } from "@/features/finanzas/hooks/use-financial-period";
import type { CategoriaGastoRow, GastoRow } from "@/features/finanzas/types";
import {
  calcularGastosPorCategoria,
  calcularIngresosPorTipo,
  calcularResumenFinanciero,
  calcularSerieMensual,
  evaluarAlertaGastos,
  filtrarGastosPorRango,
} from "@/features/finanzas/utils/finanzas.utils";
import type { CompraRow } from "@/features/compras/types";
import type { DetalleVentaRow, VentaRow } from "@/features/ventas/types";

interface FinanzasDashboardProps {
  ventas: VentaRow[];
  compras: CompraRow[];
  gastos: GastoRow[];
  categorias: CategoriaGastoRow[];
  lineasVenta: Pick<DetalleVentaRow, "venta_id" | "tipo" | "subtotal">[];
}

export function FinanzasDashboard({ ventas, compras, gastos, categorias, lineasVenta }: FinanzasDashboardProps) {
  const { periodo, setPeriodo, personalizado, setPersonalizado, rango, rangoAnterior } = useFinancialPeriod();

  const summary = useMemo(() => calcularResumenFinanciero(ventas, compras, gastos, rango), [ventas, compras, gastos, rango]);
  const serieMensual = useMemo(() => calcularSerieMensual(ventas, compras, gastos, rango), [ventas, compras, gastos, rango]);
  const gastosPorCategoria = useMemo(
    () => calcularGastosPorCategoria(gastos, categorias, rango),
    [gastos, categorias, rango],
  );
  const ingresosPorTipo = useMemo(
    () => calcularIngresosPorTipo(ventas, lineasVenta, rango),
    [ventas, lineasVenta, rango],
  );

  const alertaGastos = useMemo(() => {
    const gastoActual = filtrarGastosPorRango(gastos, rango).reduce((sum, g) => sum + g.monto, 0);
    const gastoAnterior = filtrarGastosPorRango(gastos, rangoAnterior).reduce((sum, g) => sum + g.monto, 0);
    return evaluarAlertaGastos(gastoActual, gastoAnterior);
  }, [gastos, rango, rangoAnterior]);

  return (
    <div className="flex flex-col gap-6">
      <FinancialPeriodFilter
        periodo={periodo}
        onPeriodoChange={setPeriodo}
        personalizado={personalizado}
        onPersonalizadoChange={setPersonalizado}
      />

      <FinancialSummary summary={summary} />

      <FinancialAlerts resultadoOperativo={summary.resultadoOperativo} alertaGastos={alertaGastos} />

      <IncomeExpenseChart data={serieMensual} />

      <div className="grid gap-4 xl:grid-cols-2">
        <ExpenseCategoryChart data={gastosPorCategoria} />
        <IncomeTypeChart data={ingresosPorTipo} />
      </div>
    </div>
  );
}
