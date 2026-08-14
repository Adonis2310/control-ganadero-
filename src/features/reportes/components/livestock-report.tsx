"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, Tooltip, XAxis, YAxis } from "recharts";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ReportChart } from "@/features/reportes/components/report-chart";
import { ReportExport } from "@/features/reportes/components/report-export";
import { ReportTable } from "@/features/reportes/components/report-table";
import type { RangoFechas } from "@/features/finanzas/types";
import { ESTADO_OPTIONS, type Animal } from "@/features/ganado/types";
import { formatearFecha } from "@/features/ganado/utils/animal.utils";
import {
  calcularDistribucionPorEstado,
  calcularDistribucionPorRaza,
  calcularDistribucionPorSexo,
  calcularLivestockReportStats,
} from "@/features/reportes/utils/reportes.utils";

const COLORES = ["var(--color-chart-1)", "var(--color-chart-2)", "var(--color-chart-3)", "var(--color-chart-4)", "var(--color-chart-5)"];

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

export function LivestockReport({ animales, rango, periodoLabel }: { animales: Animal[]; rango: RangoFechas; periodoLabel: string }) {
  const stats = useMemo(() => calcularLivestockReportStats(animales, rango), [animales, rango]);
  const porSexo = useMemo(() => calcularDistribucionPorSexo(animales), [animales]);
  const porRaza = useMemo(() => calcularDistribucionPorRaza(animales), [animales]);
  const porEstado = useMemo(() => calcularDistribucionPorEstado(animales), [animales]);
  const estadoLabel = Object.fromEntries(ESTADO_OPTIONS.map((o) => [o.value, o.label]));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h3 className="text-lg font-semibold">Reporte de Ganado</h3>
          <p className="text-sm text-muted-foreground">Composición y movimientos del hato.</p>
        </div>
        <div className="flex items-center gap-2 print:hidden">
          <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/ganado" />}>
            Ir a Ganado
          </Button>
          <ReportExport
            titulo="Reporte de Ganado"
            periodoLabel={periodoLabel}
            columnas={[
              { header: "Arete", accessor: (a: Animal) => a.identificador },
              { header: "Nombre", accessor: (a: Animal) => a.nombre ?? "" },
              { header: "Raza", accessor: (a: Animal) => a.raza?.nombre ?? "" },
              { header: "Sexo", accessor: (a: Animal) => (a.sexo === "macho" ? "Macho" : "Hembra") },
              { header: "Estado", accessor: (a: Animal) => estadoLabel[a.estado] ?? a.estado },
              { header: "Fecha de nacimiento", accessor: (a: Animal) => formatearFecha(a.fecha_nacimiento) },
            ]}
            filas={animales}
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-6">
        <Stat label="Total" value={String(stats.total)} />
        <Stat label="Machos" value={String(stats.machos)} />
        <Stat label="Hembras" value={String(stats.hembras)} />
        <Stat label="Activos" value={String(stats.activos)} />
        <Stat label="Vendidos" value={String(stats.vendidos)} />
        <Stat label="Fallecidos" value={String(stats.fallecidos)} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Stat label="Nacimientos en el período" value={String(stats.nacimientosEnPeriodo)} />
        <Stat label="Bajas en el período" value="No hay datos suficientes para calcular esta métrica." />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <ReportChart title="Distribución por sexo" isEmpty={animales.length === 0}>
          <PieChart>
            <Pie data={porSexo} dataKey="cantidad" nameKey="etiqueta" innerRadius={50} outerRadius={80} paddingAngle={2}>
              {porSexo.map((entry, index) => (
                <Cell key={entry.clave} fill={COLORES[index % COLORES.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
          </PieChart>
        </ReportChart>

        <ReportChart title="Distribución por raza" isEmpty={porRaza.length === 0}>
          <BarChart data={porRaza} layout="vertical" margin={{ top: 8, right: 24, bottom: 0, left: 12 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
            <XAxis type="number" tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
            <YAxis type="category" dataKey="etiqueta" tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }} axisLine={{ stroke: "var(--color-border)" }} tickLine={false} width={100} />
            <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
            <Bar dataKey="cantidad" name="Animales" fill="var(--color-chart-2)" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ReportChart>

        <ReportChart title="Distribución por estado" isEmpty={porEstado.length === 0}>
          <PieChart>
            <Pie data={porEstado} dataKey="cantidad" nameKey="etiqueta" innerRadius={50} outerRadius={80} paddingAngle={2}>
              {porEstado.map((entry, index) => (
                <Cell key={entry.clave} fill={COLORES[index % COLORES.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
          </PieChart>
        </ReportChart>
      </div>

      <ReportTable
        columns={[
          { header: "Arete", cell: (a: Animal) => a.identificador },
          { header: "Nombre", cell: (a: Animal) => a.nombre ?? "—" },
          { header: "Raza", cell: (a: Animal) => a.raza?.nombre ?? "—" },
          { header: "Sexo", cell: (a: Animal) => (a.sexo === "macho" ? "Macho" : "Hembra") },
          { header: "Estado", cell: (a: Animal) => estadoLabel[a.estado] ?? a.estado },
          { header: "Fecha de nacimiento", cell: (a: Animal) => formatearFecha(a.fecha_nacimiento) },
        ]}
        rows={animales}
        keyField={(a) => a.id}
        emptyMessage="No hay animales registrados."
      />
    </div>
  );
}
