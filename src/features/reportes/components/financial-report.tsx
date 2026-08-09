"use client";

import Link from "next/link";
import { useMemo } from "react";

import { Button } from "@/components/ui/button";
import { FinancialSummary } from "@/features/finanzas/components/financial-summary";
import { IncomeExpenseChart } from "@/features/finanzas/components/income-expense-chart";
import { ReportExport } from "@/features/reportes/components/report-export";
import { ReportTable } from "@/features/reportes/components/report-table";
import type { FinancialSummaryData, IncomeExpenseMonthPoint } from "@/features/finanzas/types";
import { formatearMoneda } from "@/features/inventario/utils/inventario.utils";

interface FinancialReportProps {
  summary: FinancialSummaryData;
  serieMensual: IncomeExpenseMonthPoint[];
  periodoLabel: string;
}

/** Reutiliza exactamente los componentes y cálculos de /finanzas (sección 12: no crear una segunda lógica financiera). */
export function FinancialReport({ summary, serieMensual, periodoLabel }: FinancialReportProps) {
  const filas = useMemo(
    () => serieMensual.map((punto) => ({ ...punto, resultado: punto.ingresos - punto.compras - punto.gastos })),
    [serieMensual],
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h3 className="text-lg font-semibold">Resumen Financiero</h3>
          <p className="text-sm text-muted-foreground">Ingresos, egresos y resultado operativo del período.</p>
        </div>
        <div className="flex items-center gap-2 print:hidden">
          <Button variant="ghost" size="sm" nativeButton={false} render={<Link href="/finanzas" />}>
            Ir a Finanzas
          </Button>
          <ReportExport
            titulo="Resumen Financiero"
            periodoLabel={periodoLabel}
            columnas={[
              { header: "Mes", accessor: (f: (typeof filas)[number]) => f.mesLabel },
              { header: "Ingresos", accessor: (f: (typeof filas)[number]) => f.ingresos },
              { header: "Compras", accessor: (f: (typeof filas)[number]) => f.compras },
              { header: "Gastos", accessor: (f: (typeof filas)[number]) => f.gastos },
              { header: "Resultado", accessor: (f: (typeof filas)[number]) => f.resultado },
            ]}
            filas={filas}
          />
        </div>
      </div>

      <FinancialSummary summary={summary} />

      <IncomeExpenseChart data={serieMensual} />

      <ReportTable
        columns={[
          { header: "Mes", cell: (f: (typeof filas)[number]) => f.mesLabel },
          { header: "Ingresos", cell: (f: (typeof filas)[number]) => formatearMoneda(f.ingresos) },
          { header: "Compras", cell: (f: (typeof filas)[number]) => formatearMoneda(f.compras) },
          { header: "Gastos", cell: (f: (typeof filas)[number]) => formatearMoneda(f.gastos) },
          { header: "Resultado", cell: (f: (typeof filas)[number]) => formatearMoneda(f.resultado) },
        ]}
        rows={filas}
        keyField={(f) => f.mes}
        emptyMessage="No hay movimientos financieros en este período."
      />
    </div>
  );
}
