"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, Tooltip, XAxis, YAxis } from "recharts";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ActivityPriorityBadge } from "@/features/calendario/components/activity-priority-badge";
import { ActivityStatusBadge } from "@/features/calendario/components/activity-status-badge";
import type { ActividadConAnimal } from "@/features/calendario/types";
import { TIPO_ACTIVIDAD_LABEL, formatearFechaActividad } from "@/features/calendario/utils/actividad.utils";
import type { RangoFechas } from "@/features/finanzas/types";
import { ReportChart } from "@/features/reportes/components/report-chart";
import { ReportExport } from "@/features/reportes/components/report-export";
import { ReportTable } from "@/features/reportes/components/report-table";
import { calcularActivitiesPorTipo, calcularActivitiesReportStats, dentroDeRango } from "@/features/reportes/utils/reportes.utils";

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

interface ActivitiesReportProps {
  actividades: ActividadConAnimal[];
  rango: RangoFechas;
  periodoLabel: string;
}

export function ActivitiesReport({ actividades, rango, periodoLabel }: ActivitiesReportProps) {
  const stats = useMemo(() => calcularActivitiesReportStats(actividades, rango), [actividades, rango]);
  const porTipo = useMemo(() => calcularActivitiesPorTipo(actividades, rango), [actividades, rango]);
  const actividadesEnRango = useMemo(() => actividades.filter((a) => dentroDeRango(a.fecha, rango)), [actividades, rango]);

  const cumplimiento = [
    { etiqueta: "Completadas", cantidad: stats.completadas },
    { etiqueta: "Pendientes", cantidad: stats.pendientes },
  ].filter((p) => p.cantidad > 0);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h3 className="text-lg font-semibold">Reporte de Actividades</h3>
          <p className="text-sm text-muted-foreground">Actividades del calendario ganadero en el período.</p>
        </div>
        <div className="flex items-center gap-2 print:hidden">
          <Button variant="ghost" size="sm" nativeButton={false} render={<Link href="/calendario" />}>
            Ir a Calendario
          </Button>
          <ReportExport
            titulo="Reporte de Actividades"
            periodoLabel={periodoLabel}
            columnas={[
              { header: "Fecha", accessor: (a: ActividadConAnimal) => formatearFechaActividad(a.fecha) },
              { header: "Título", accessor: (a: ActividadConAnimal) => a.titulo },
              { header: "Tipo", accessor: (a: ActividadConAnimal) => TIPO_ACTIVIDAD_LABEL[a.tipo] },
              { header: "Estado", accessor: (a: ActividadConAnimal) => a.estado },
              { header: "Prioridad", accessor: (a: ActividadConAnimal) => a.prioridad },
            ]}
            filas={actividadesEnRango}
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Completadas" value={String(stats.completadas)} />
        <Stat label="Pendientes" value={String(stats.pendientes)} />
        <Stat label="Canceladas" value={String(stats.canceladas)} />
        <Stat label="Vencidas" value={String(stats.vencidas)} />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <ReportChart title="Actividades por tipo" isEmpty={porTipo.length === 0}>
          <BarChart data={porTipo} layout="vertical" margin={{ top: 8, right: 24, bottom: 0, left: 12 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
            <XAxis type="number" tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
            <YAxis type="category" dataKey="etiqueta" tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }} axisLine={{ stroke: "var(--color-border)" }} tickLine={false} width={110} />
            <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
            <Bar dataKey="cantidad" name="Actividades" fill="var(--color-chart-4)" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ReportChart>

        <ReportChart
          title="Cumplimiento de actividades"
          description="Completadas frente a pendientes en el período (no representa una métrica de productividad)"
          isEmpty={cumplimiento.length === 0}
        >
          <PieChart>
            <Pie data={cumplimiento} dataKey="cantidad" nameKey="etiqueta" innerRadius={50} outerRadius={80} paddingAngle={2}>
              {cumplimiento.map((entry, index) => (
                <Cell key={entry.etiqueta} fill={COLORES[index % COLORES.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
          </PieChart>
        </ReportChart>
      </div>

      <ReportTable
        columns={[
          { header: "Fecha", cell: (a: ActividadConAnimal) => formatearFechaActividad(a.fecha) },
          {
            header: "Título",
            cell: (a: ActividadConAnimal) => (
              <Link href={`/calendario/${a.id}`} className="hover:underline">
                {a.titulo}
              </Link>
            ),
          },
          { header: "Tipo", cell: (a: ActividadConAnimal) => TIPO_ACTIVIDAD_LABEL[a.tipo] },
          { header: "Estado", cell: (a: ActividadConAnimal) => <ActivityStatusBadge estado={a.estado} fecha={a.fecha} /> },
          { header: "Prioridad", cell: (a: ActividadConAnimal) => <ActivityPriorityBadge prioridad={a.prioridad} /> },
        ]}
        rows={actividadesEnRango}
        keyField={(a) => a.id}
        emptyMessage="No hay actividades registradas en este período."
      />
    </div>
  );
}
