"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { MoneyBarTooltip, ReportChart } from "@/features/reportes/components/report-chart";
import { ReportExport } from "@/features/reportes/components/report-export";
import { ReportTable } from "@/features/reportes/components/report-table";
import type { IncomeExpenseMonthPoint, RangoFechas } from "@/features/finanzas/types";
import { formatearMonedaCompacta } from "@/features/finanzas/utils/finanzas.utils";
import { formatearFecha } from "@/features/ganado/utils/animal.utils";
import { formatearMoneda } from "@/features/inventario/utils/inventario.utils";
import type { DetalleVentaRow, VentaConCliente } from "@/features/ventas/types";
import { ESTADO_VENTA_BADGE_CLASS, ESTADO_VENTA_LABEL, formatearNumeroVenta } from "@/features/ventas/utils/venta.utils";
import { calcularSalesReportStats, calcularTopClientes } from "@/features/reportes/utils/reportes.utils";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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

interface SalesReportProps {
  ventas: VentaConCliente[];
  lineas: Pick<DetalleVentaRow, "venta_id" | "tipo">[];
  serieMensual: IncomeExpenseMonthPoint[];
  rango: RangoFechas;
  periodoLabel: string;
}

export function SalesReport({ ventas, lineas, serieMensual, rango, periodoLabel }: SalesReportProps) {
  const stats = useMemo(() => calcularSalesReportStats(ventas, lineas, rango), [ventas, lineas, rango]);
  const topClientes = useMemo(() => calcularTopClientes(ventas, rango), [ventas, rango]);
  const ventasEnRango = useMemo(() => ventas.filter((v) => v.fecha >= rango.desde && v.fecha <= rango.hasta), [ventas, rango]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h3 className="text-lg font-semibold">Reporte de Ventas</h3>
          <p className="text-sm text-muted-foreground">Ventas realizadas a clientes en el período.</p>
        </div>
        <div className="flex items-center gap-2 print:hidden">
          <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/ventas" />}>
            Ir a Ventas
          </Button>
          <ReportExport
            titulo="Reporte de Ventas"
            periodoLabel={periodoLabel}
            columnas={[
              { header: "Número", accessor: (v: VentaConCliente) => formatearNumeroVenta(v.numero) },
              { header: "Fecha", accessor: (v: VentaConCliente) => formatearFecha(v.fecha) },
              { header: "Cliente", accessor: (v: VentaConCliente) => v.cliente?.nombre ?? "" },
              { header: "Estado", accessor: (v: VentaConCliente) => ESTADO_VENTA_LABEL[v.estado] },
              { header: "Total", accessor: (v: VentaConCliente) => v.total },
            ]}
            filas={ventasEnRango}
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <Stat label="Total vendido" value={formatearMoneda(stats.totalVendido)} />
        <Stat label="Número de ventas" value={String(stats.numeroVentas)} />
        <Stat label="Animales vendidos" value={String(stats.animalesVendidos)} />
        <Stat label="Productos vendidos" value={String(stats.productosVendidos)} />
        <Stat label="Venta promedio" value={stats.ventaPromedio !== null ? formatearMoneda(stats.ventaPromedio) : "—"} />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <ReportChart title="Ventas por período" description="Evolución de ventas completadas" isEmpty={serieMensual.every((p) => p.ingresos === 0)}>
          <BarChart data={serieMensual} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
            <XAxis dataKey="mesLabel" tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }} axisLine={{ stroke: "var(--color-border)" }} tickLine={false} />
            <YAxis tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }} axisLine={false} tickLine={false} width={56} tickFormatter={(value: number) => formatearMonedaCompacta(value)} />
            <Tooltip content={<MoneyBarTooltip />} cursor={{ fill: "var(--color-muted)" }} />
            <Bar dataKey="ingresos" name="Ventas" fill="var(--color-chart-1)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ReportChart>

        <Card>
          <CardHeader>
            <p className="font-medium">Principales clientes</p>
            <p className="text-sm text-muted-foreground">Por monto comprado (ventas completadas)</p>
          </CardHeader>
          <CardContent>
            {topClientes.length === 0 ? (
              <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
                No hay ventas completadas en este período.
              </div>
            ) : (
              <ul className="flex flex-col gap-2">
                {topClientes.map((cliente) => (
                  <li key={cliente.id} className="flex items-center justify-between gap-2 text-sm">
                    <Link href={`/clientes/${cliente.id}`} className="hover:underline">
                      {cliente.nombre}
                    </Link>
                    <span className="font-medium">{formatearMoneda(cliente.monto)}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <ReportTable
        columns={[
          { header: "Número", cell: (v: VentaConCliente) => formatearNumeroVenta(v.numero) },
          { header: "Fecha", cell: (v: VentaConCliente) => formatearFecha(v.fecha) },
          {
            header: "Cliente",
            cell: (v: VentaConCliente) =>
              v.cliente ? (
                <Link href={`/clientes/${v.cliente.id}`} className="hover:underline">
                  {v.cliente.nombre}
                </Link>
              ) : (
                "—"
              ),
          },
          {
            header: "Estado",
            cell: (v: VentaConCliente) => (
              <Badge variant="outline" className={cn("border-transparent font-medium", ESTADO_VENTA_BADGE_CLASS[v.estado])}>
                {ESTADO_VENTA_LABEL[v.estado]}
              </Badge>
            ),
          },
          { header: "Total", cell: (v: VentaConCliente) => formatearMoneda(v.total) },
        ]}
        rows={ventasEnRango}
        keyField={(v) => v.id}
        emptyMessage="No hay ventas registradas en este período."
      />
    </div>
  );
}
