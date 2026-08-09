"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ReportChart } from "@/features/reportes/components/report-chart";
import { ReportExport } from "@/features/reportes/components/report-export";
import { ReportTable } from "@/features/reportes/components/report-table";
import type { RangoFechas } from "@/features/finanzas/types";
import type { AnimalRef, EventoReproductivoRow, GestacionRow, SexoAnimal } from "@/features/ganado/types";
import { formatearFecha } from "@/features/ganado/utils/animal.utils";
import { construirDatosGenerales, construirTimelineReproductivo } from "@/features/ganado/utils/reproduccion.utils";
import { calcularReproductionReportStats, dentroDeRango } from "@/features/reportes/utils/reportes.utils";
import type { RegistroReproductivo } from "@/features/ganado/types";

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

interface ReproductionReportProps {
  animales: (AnimalRef & { sexo: SexoAnimal })[];
  gestaciones: GestacionRow[];
  eventos: EventoReproductivoRow[];
  rango: RangoFechas;
  periodoLabel: string;
}

export function ReproductionReport({ animales, gestaciones, eventos, rango, periodoLabel }: ReproductionReportProps) {
  const { stats: statsActuales } = useMemo(() => construirDatosGenerales(animales, gestaciones, eventos), [animales, gestaciones, eventos]);
  const statsPeriodo = useMemo(
    () => calcularReproductionReportStats(statsActuales.hembras, gestaciones, eventos, rango),
    [statsActuales.hembras, gestaciones, eventos, rango],
  );

  const timeline = useMemo(() => construirTimelineReproductivo(eventos), [eventos]);
  const timelineEnRango = useMemo(() => timeline.filter((e) => dentroDeRango(e.fecha, rango)), [timeline, rango]);

  const porTipo = [
    { etiqueta: "Inseminaciones", cantidad: statsPeriodo.inseminaciones },
    { etiqueta: "Gestaciones iniciadas", cantidad: statsPeriodo.gestacionesIniciadas },
    { etiqueta: "Diagnósticos", cantidad: statsPeriodo.diagnosticos },
    { etiqueta: "Partos", cantidad: statsPeriodo.partos },
  ].filter((p) => p.cantidad > 0);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h3 className="text-lg font-semibold">Reporte de Reproducción</h3>
          <p className="text-sm text-muted-foreground">Actividad reproductiva del hato en el período.</p>
        </div>
        <div className="flex items-center gap-2 print:hidden">
          <Button variant="ghost" size="sm" nativeButton={false} render={<Link href="/reproduccion" />}>
            Ir a Reproducción
          </Button>
          <ReportExport
            titulo="Reporte de Reproducción"
            periodoLabel={periodoLabel}
            columnas={[
              { header: "Fecha", accessor: (e: RegistroReproductivo) => formatearFecha(e.fecha) },
              { header: "Evento", accessor: (e: RegistroReproductivo) => e.titulo },
              { header: "Detalle", accessor: (e: RegistroReproductivo) => e.detalle ?? "" },
            ]}
            filas={timelineEnRango}
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-4">
        <Stat label="Hembras reproductivas" value={String(statsActuales.hembras)} />
        <Stat label="Hembras gestantes (actual)" value={String(statsActuales.hembrasGestantes)} />
        <Stat label="Inseminaciones (período)" value={String(statsPeriodo.inseminaciones)} />
        <Stat label="Gestaciones iniciadas (período)" value={String(statsPeriodo.gestacionesIniciadas)} />
      </div>
      <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-4">
        <Stat
          label="Diagnósticos de preñez (período)"
          value={statsPeriodo.diagnosticos > 0 ? `${statsPeriodo.diagnosticos} (${statsPeriodo.diagnosticosPositivos} positivos)` : "0"}
        />
        <Stat label="Partos (período)" value={String(statsPeriodo.partos)} />
        <Stat label="Nacimientos (período)" value={String(statsPeriodo.nacimientos)} />
        <Stat label="Partos próximos (actual)" value={String(statsActuales.partosProximos)} />
      </div>

      <ReportChart title="Eventos reproductivos del período" isEmpty={porTipo.length === 0}>
        <BarChart data={porTipo} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
          <XAxis dataKey="etiqueta" tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }} axisLine={{ stroke: "var(--color-border)" }} tickLine={false} />
          <YAxis tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} width={36} />
          <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
          <Bar dataKey="cantidad" name="Eventos" fill="var(--color-chart-4)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ReportChart>

      <ReportTable
        columns={[
          { header: "Fecha", cell: (e: RegistroReproductivo) => formatearFecha(e.fecha) },
          { header: "Evento", cell: (e: RegistroReproductivo) => e.titulo },
          { header: "Detalle", cell: (e: RegistroReproductivo) => e.detalle ?? "—" },
        ]}
        rows={timelineEnRango}
        keyField={(e) => e.id}
        emptyMessage="No hay eventos reproductivos registrados en este período."
      />
    </div>
  );
}
