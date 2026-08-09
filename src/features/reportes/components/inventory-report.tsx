"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, Legend, Tooltip, XAxis, YAxis } from "recharts";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ReportChart } from "@/features/reportes/components/report-chart";
import { ReportExport } from "@/features/reportes/components/report-export";
import { ReportTable } from "@/features/reportes/components/report-table";
import type { RangoFechas } from "@/features/finanzas/types";
import type { MovimientoConProducto, ProductoInventario } from "@/features/inventario/types";
import { ESTADO_STOCK_BADGE_CLASS, ESTADO_STOCK_LABEL, calcularEstadoStock, calcularInventoryStats, formatearCantidad, formatearMoneda } from "@/features/inventario/utils/inventario.utils";
import { calcularMovimientosPorPeriodo, calcularProductosMasUtilizados } from "@/features/reportes/utils/reportes.utils";
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

interface InventoryReportProps {
  productos: ProductoInventario[];
  movimientos: MovimientoConProducto[];
  meses: { mes: string; mesLabel: string }[];
  rango: RangoFechas;
  periodoLabel: string;
}

export function InventoryReport({ productos, movimientos, meses, rango, periodoLabel }: InventoryReportProps) {
  const stats = useMemo(() => calcularInventoryStats(productos), [productos]);
  const movimientosPorPeriodo = useMemo(() => calcularMovimientosPorPeriodo(movimientos, meses), [movimientos, meses]);
  const productosMasUtilizados = useMemo(() => calcularProductosMasUtilizados(movimientos, rango), [movimientos, rango]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h3 className="text-lg font-semibold">Reporte de Inventario</h3>
          <p className="text-sm text-muted-foreground">Stock actual y movimientos del período.</p>
        </div>
        <div className="flex items-center gap-2 print:hidden">
          <Button variant="ghost" size="sm" nativeButton={false} render={<Link href="/inventario" />}>
            Ir a Inventario
          </Button>
          <ReportExport
            titulo="Reporte de Inventario"
            periodoLabel={periodoLabel}
            columnas={[
              { header: "Producto", accessor: (p: ProductoInventario) => p.nombre },
              { header: "Categoría", accessor: (p: ProductoInventario) => p.categoria?.nombre ?? "" },
              { header: "Stock actual", accessor: (p: ProductoInventario) => p.stock_actual },
              { header: "Stock mínimo", accessor: (p: ProductoInventario) => p.stock_minimo },
              { header: "Estado", accessor: (p: ProductoInventario) => ESTADO_STOCK_LABEL[calcularEstadoStock(p)] },
            ]}
            filas={productos}
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Productos registrados" value={String(stats.totalProductos)} />
        <Stat label="Stock bajo" value={String(stats.stockBajo)} />
        <Stat label="Agotados" value={String(stats.agotados)} />
        <Stat label="Valor estimado" value={formatearMoneda(stats.valorEstimado)} />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <ReportChart title="Movimientos de inventario" description="Entradas vs. salidas por período" isEmpty={movimientosPorPeriodo.every((p) => p.entradas === 0 && p.salidas === 0)}>
          <BarChart data={movimientosPorPeriodo} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
            <XAxis dataKey="periodoLabel" tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }} axisLine={{ stroke: "var(--color-border)" }} tickLine={false} />
            <YAxis tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }} axisLine={false} tickLine={false} width={40} />
            <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="entradas" name="Entradas" fill="var(--color-chart-1)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="salidas" name="Salidas" fill="var(--color-chart-3)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ReportChart>

        <Card>
          <CardHeader>
            <p className="font-medium">Productos más utilizados</p>
            <p className="text-sm text-muted-foreground">Ordenado por cantidad de salidas en el período</p>
          </CardHeader>
          <CardContent>
            {productosMasUtilizados.length === 0 ? (
              <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
                No hay salidas registradas en este período.
              </div>
            ) : (
              <ul className="flex flex-col gap-2">
                {productosMasUtilizados.map((producto) => (
                  <li key={producto.productoId} className="flex items-center justify-between gap-2 text-sm">
                    <span>{producto.nombre}</span>
                    <span className="font-medium">
                      {formatearCantidad(producto.cantidadSalidas)} {producto.unidadMedida}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <ReportTable
        columns={[
          { header: "Producto", cell: (p: ProductoInventario) => p.nombre },
          { header: "Categoría", cell: (p: ProductoInventario) => p.categoria?.nombre ?? "—" },
          { header: "Stock actual", cell: (p: ProductoInventario) => formatearCantidad(p.stock_actual) },
          { header: "Stock mínimo", cell: (p: ProductoInventario) => formatearCantidad(p.stock_minimo) },
          {
            header: "Estado",
            cell: (p: ProductoInventario) => {
              const estado = calcularEstadoStock(p);
              return (
                <Badge variant="outline" className={cn("border-transparent font-medium", ESTADO_STOCK_BADGE_CLASS[estado])}>
                  {ESTADO_STOCK_LABEL[estado]}
                </Badge>
              );
            },
          },
        ]}
        rows={productos}
        keyField={(p) => p.id}
        emptyMessage="No hay productos registrados."
      />
    </div>
  );
}
