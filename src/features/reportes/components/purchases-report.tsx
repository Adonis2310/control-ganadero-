"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { MoneyBarTooltip, ReportChart } from "@/features/reportes/components/report-chart";
import { ReportExport } from "@/features/reportes/components/report-export";
import { ReportTable } from "@/features/reportes/components/report-table";
import type { IncomeExpenseMonthPoint, RangoFechas } from "@/features/finanzas/types";
import { formatearMonedaCompacta } from "@/features/finanzas/utils/finanzas.utils";
import type { CompraConProveedor } from "@/features/compras/types";
import { ESTADO_COMPRA_BADGE_CLASS, ESTADO_COMPRA_LABEL, formatearNumeroCompra } from "@/features/compras/utils/compra.utils";
import { formatearFecha } from "@/features/ganado/utils/animal.utils";
import { formatearMoneda } from "@/features/inventario/utils/inventario.utils";
import { calcularPurchasesReportStats, calcularTopProveedores } from "@/features/reportes/utils/reportes.utils";
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

interface PurchasesReportProps {
  compras: CompraConProveedor[];
  serieMensual: IncomeExpenseMonthPoint[];
  rango: RangoFechas;
  periodoLabel: string;
}

export function PurchasesReport({ compras, serieMensual, rango, periodoLabel }: PurchasesReportProps) {
  const stats = useMemo(() => calcularPurchasesReportStats(compras, rango), [compras, rango]);
  const topProveedores = useMemo(() => calcularTopProveedores(compras, rango), [compras, rango]);
  const comprasEnRango = useMemo(() => compras.filter((c) => c.fecha >= rango.desde && c.fecha <= rango.hasta), [compras, rango]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h3 className="text-lg font-semibold">Reporte de Compras</h3>
          <p className="text-sm text-muted-foreground">Compras realizadas a proveedores en el período.</p>
        </div>
        <div className="flex items-center gap-2 print:hidden">
          <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/compras" />}>
            Ir a Compras
          </Button>
          <ReportExport
            titulo="Reporte de Compras"
            periodoLabel={periodoLabel}
            columnas={[
              { header: "Número", accessor: (c: CompraConProveedor) => formatearNumeroCompra(c.numero) },
              { header: "Fecha", accessor: (c: CompraConProveedor) => formatearFecha(c.fecha) },
              { header: "Proveedor", accessor: (c: CompraConProveedor) => c.proveedor?.nombre ?? "" },
              { header: "Estado", accessor: (c: CompraConProveedor) => ESTADO_COMPRA_LABEL[c.estado] },
              { header: "Total", accessor: (c: CompraConProveedor) => c.total },
            ]}
            filas={comprasEnRango}
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Total comprado" value={formatearMoneda(stats.totalComprado)} />
        <Stat label="Número de compras" value={String(stats.numeroCompras)} />
        <Stat label="Recibidas" value={String(stats.recibidas)} />
        <Stat label="Pendientes / canceladas" value={`${stats.pendientes} / ${stats.canceladas}`} />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <ReportChart title="Compras por período" isEmpty={serieMensual.every((p) => p.compras === 0)}>
          <BarChart data={serieMensual} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
            <XAxis dataKey="mesLabel" tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }} axisLine={{ stroke: "var(--color-border)" }} tickLine={false} />
            <YAxis tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }} axisLine={false} tickLine={false} width={56} tickFormatter={(value: number) => formatearMonedaCompacta(value)} />
            <Tooltip content={<MoneyBarTooltip />} cursor={{ fill: "var(--color-muted)" }} />
            <Bar dataKey="compras" name="Compras" fill="var(--color-chart-2)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ReportChart>

        <Card>
          <CardHeader>
            <p className="font-medium">Principales proveedores</p>
            <p className="text-sm text-muted-foreground">Por monto comprado (compras recibidas)</p>
          </CardHeader>
          <CardContent>
            {topProveedores.length === 0 ? (
              <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
                No hay compras recibidas en este período.
              </div>
            ) : (
              <ul className="flex flex-col gap-2">
                {topProveedores.map((proveedor) => (
                  <li key={proveedor.id} className="flex items-center justify-between gap-2 text-sm">
                    <Link href={`/proveedores/${proveedor.id}`} className="hover:underline">
                      {proveedor.nombre}
                    </Link>
                    <span className="font-medium">{formatearMoneda(proveedor.monto)}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <ReportTable
        columns={[
          { header: "Número", cell: (c: CompraConProveedor) => formatearNumeroCompra(c.numero) },
          { header: "Fecha", cell: (c: CompraConProveedor) => formatearFecha(c.fecha) },
          {
            header: "Proveedor",
            cell: (c: CompraConProveedor) =>
              c.proveedor ? (
                <Link href={`/proveedores/${c.proveedor.id}`} className="hover:underline">
                  {c.proveedor.nombre}
                </Link>
              ) : (
                "—"
              ),
          },
          {
            header: "Estado",
            cell: (c: CompraConProveedor) => (
              <Badge variant="outline" className={cn("border-transparent font-medium", ESTADO_COMPRA_BADGE_CLASS[c.estado])}>
                {ESTADO_COMPRA_LABEL[c.estado]}
              </Badge>
            ),
          },
          { header: "Total", cell: (c: CompraConProveedor) => formatearMoneda(c.total) },
        ]}
        rows={comprasEnRango}
        keyField={(c) => c.id}
        emptyMessage="No hay compras registradas en este período."
      />
    </div>
  );
}
