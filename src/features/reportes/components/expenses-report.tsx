"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ExpenseCategoryChart } from "@/features/finanzas/components/expense-category-chart";
import { MoneyBarTooltip, ReportChart } from "@/features/reportes/components/report-chart";
import { ReportExport } from "@/features/reportes/components/report-export";
import { ReportTable } from "@/features/reportes/components/report-table";
import type { CategoriaGastoRow, GastoConReferencias, IncomeExpenseMonthPoint, RangoFechas } from "@/features/finanzas/types";
import { calcularGastosPorCategoria, formatearMonedaCompacta } from "@/features/finanzas/utils/finanzas.utils";
import { formatearFecha } from "@/features/ganado/utils/animal.utils";
import { formatearMoneda } from "@/features/inventario/utils/inventario.utils";
import { calcularExpensesReportStats } from "@/features/reportes/utils/reportes.utils";

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card className="gap-2 py-4">
      <CardHeader className="px-4">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
      </CardHeader>
      <CardContent className="px-4">
        <div className="text-xl font-semibold tracking-tight">{value}</div>
      </CardContent>
    </Card>
  );
}

interface ExpensesReportProps {
  gastos: GastoConReferencias[];
  categorias: CategoriaGastoRow[];
  serieMensual: IncomeExpenseMonthPoint[];
  rango: RangoFechas;
  periodoLabel: string;
}

export function ExpensesReport({ gastos, categorias, serieMensual, rango, periodoLabel }: ExpensesReportProps) {
  const stats = useMemo(() => calcularExpensesReportStats(gastos, rango), [gastos, rango]);
  const gastosPorCategoria = useMemo(() => calcularGastosPorCategoria(gastos, categorias, rango), [gastos, categorias, rango]);
  const gastosEnRango = useMemo(() => gastos.filter((g) => g.fecha >= rango.desde && g.fecha <= rango.hasta), [gastos, rango]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h3 className="text-lg font-semibold">Reporte de Gastos</h3>
          <p className="text-sm text-muted-foreground">Gastos operativos registrados en el período.</p>
        </div>
        <div className="flex items-center gap-2 print:hidden">
          <Button variant="ghost" size="sm" nativeButton={false} render={<Link href="/finanzas/gastos" />}>
            Ir a Gastos
          </Button>
          <ReportExport
            titulo="Reporte de Gastos"
            periodoLabel={periodoLabel}
            columnas={[
              { header: "Fecha", accessor: (g: GastoConReferencias) => formatearFecha(g.fecha) },
              { header: "Categoría", accessor: (g: GastoConReferencias) => g.categoria?.nombre ?? "" },
              { header: "Descripción", accessor: (g: GastoConReferencias) => g.descripcion },
              { header: "Proveedor", accessor: (g: GastoConReferencias) => g.proveedor?.nombre ?? "" },
              { header: "Monto", accessor: (g: GastoConReferencias) => g.monto },
            ]}
            filas={gastosEnRango}
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Total de gastos" value={formatearMoneda(stats.total)} />
        <Stat label="Cantidad de gastos" value={String(stats.cantidad)} />
        <Stat label="Gasto promedio" value={stats.promedio !== null ? formatearMoneda(stats.promedio) : "—"} />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <ExpenseCategoryChart data={gastosPorCategoria} />

        <ReportChart title="Evolución de gastos" description="Gastos totales por período" isEmpty={serieMensual.every((p) => p.gastos === 0)}>
          <BarChart data={serieMensual} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
            <XAxis dataKey="mesLabel" tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }} axisLine={{ stroke: "var(--color-border)" }} tickLine={false} />
            <YAxis tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }} axisLine={false} tickLine={false} width={56} tickFormatter={(value: number) => formatearMonedaCompacta(value)} />
            <Tooltip content={<MoneyBarTooltip />} cursor={{ fill: "var(--color-muted)" }} />
            <Bar dataKey="gastos" name="Gastos" fill="var(--color-chart-3)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ReportChart>
      </div>

      <ReportTable
        columns={[
          { header: "Fecha", cell: (g: GastoConReferencias) => formatearFecha(g.fecha) },
          { header: "Categoría", cell: (g: GastoConReferencias) => g.categoria?.nombre ?? "—" },
          { header: "Descripción", cell: (g: GastoConReferencias) => g.descripcion, className: "max-w-56 truncate" },
          {
            header: "Proveedor",
            cell: (g: GastoConReferencias) =>
              g.proveedor ? (
                <Link href={`/proveedores/${g.proveedor.id}`} className="hover:underline">
                  {g.proveedor.nombre}
                </Link>
              ) : (
                "—"
              ),
          },
          { header: "Monto", cell: (g: GastoConReferencias) => formatearMoneda(g.monto) },
        ]}
        rows={gastosEnRango}
        keyField={(g) => g.id}
        emptyMessage="No hay gastos registrados en este período."
      />
    </div>
  );
}
