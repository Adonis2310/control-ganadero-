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
import type { ActividadRow } from "@/features/calendario/types";
import type { RegistroSalud } from "@/features/ganado/types";
import { formatearFecha } from "@/features/ganado/utils/animal.utils";
import { TIPO_REGISTRO_LABEL } from "@/features/ganado/utils/salud.utils";
import { calcularAnimalesConMasEventosSalud, calcularHealthReportStats, dentroDeRango } from "@/features/reportes/utils/reportes.utils";

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

interface HealthReportProps {
  registros: RegistroSalud[];
  actividades: ActividadRow[];
  rango: RangoFechas;
  periodoLabel: string;
}

export function HealthReport({ registros, actividades, rango, periodoLabel }: HealthReportProps) {
  const stats = useMemo(() => calcularHealthReportStats(registros, actividades, rango), [registros, actividades, rango]);
  const registrosEnRango = useMemo(() => registros.filter((r) => dentroDeRango(r.fecha, rango)), [registros, rango]);
  const animalesConMasEventos = useMemo(() => calcularAnimalesConMasEventosSalud(registros, rango), [registros, rango]);

  const porTipo = [
    { etiqueta: "Vacunaciones", cantidad: stats.vacunaciones },
    { etiqueta: "Desparasitaciones", cantidad: stats.desparasitaciones },
    { etiqueta: "Tratamientos", cantidad: stats.tratamientos },
    { etiqueta: "Incidencias", cantidad: stats.enfermedades },
    { etiqueta: "Consultas veterinarias", cantidad: stats.consultasVeterinarias },
  ].filter((p) => p.cantidad > 0);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h3 className="text-lg font-semibold">Reporte de Salud Animal</h3>
          <p className="text-sm text-muted-foreground">Eventos sanitarios registrados en el período.</p>
        </div>
        <div className="flex items-center gap-2 print:hidden">
          <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/salud" />}>
            Ir a Salud
          </Button>
          <ReportExport
            titulo="Reporte de Salud Animal"
            periodoLabel={periodoLabel}
            columnas={[
              { header: "Fecha", accessor: (r: RegistroSalud) => formatearFecha(r.fecha) },
              { header: "Tipo", accessor: (r: RegistroSalud) => TIPO_REGISTRO_LABEL[r.tipo] },
              { header: "Animal", accessor: (r: RegistroSalud) => r.animal?.identificador ?? "" },
              { header: "Título", accessor: (r: RegistroSalud) => r.titulo },
              { header: "Estado", accessor: (r: RegistroSalud) => r.estadoLabel },
            ]}
            filas={registrosEnRango}
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-5">
        <Stat label="Vacunaciones" value={String(stats.vacunaciones)} />
        <Stat label="Desparasitaciones" value={String(stats.desparasitaciones)} />
        <Stat label="Tratamientos" value={String(stats.tratamientos)} />
        <Stat label="Consultas veterinarias" value={String(stats.consultasVeterinarias)} />
        <Stat label="Incidencias (enfermedades)" value={String(stats.enfermedades)} />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <ReportChart title="Actividades sanitarias por tipo" description="Eventos registrados en el período seleccionado" isEmpty={porTipo.length === 0}>
          <BarChart data={porTipo} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
            <XAxis dataKey="etiqueta" tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }} axisLine={{ stroke: "var(--color-border)" }} tickLine={false} interval={0} angle={-15} textAnchor="end" height={50} />
            <YAxis tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} width={36} />
            <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
            <Bar dataKey="cantidad" name="Eventos" fill="var(--color-chart-1)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ReportChart>

        <Card>
          <CardHeader>
            <p className="font-medium">Animales con mayor cantidad de eventos sanitarios</p>
          </CardHeader>
          <CardContent>
            {animalesConMasEventos.length === 0 ? (
              <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
                No hay eventos registrados en este período.
              </div>
            ) : (
              <ul className="flex flex-col gap-2">
                {animalesConMasEventos.map((animal) => (
                  <li key={animal.animalId} className="flex items-center justify-between gap-2 text-sm">
                    <Link href={`/ganado/${animal.animalId}`} className="hover:underline">
                      {animal.identificador}
                      {animal.nombre ? ` — ${animal.nombre}` : ""}
                    </Link>
                    <span className="font-medium">{animal.cantidad} evento{animal.cantidad === 1 ? "" : "s"}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <ReportTable
        columns={[
          { header: "Fecha", cell: (r: RegistroSalud) => formatearFecha(r.fecha) },
          { header: "Tipo", cell: (r: RegistroSalud) => TIPO_REGISTRO_LABEL[r.tipo] },
          {
            header: "Animal",
            cell: (r: RegistroSalud) =>
              r.animal ? (
                <Link href={`/ganado/${r.animalId}`} className="hover:underline">
                  {r.animal.identificador}
                </Link>
              ) : (
                "—"
              ),
          },
          { header: "Título", cell: (r: RegistroSalud) => r.titulo },
          { header: "Estado", cell: (r: RegistroSalud) => r.estadoLabel },
        ]}
        rows={registrosEnRango}
        keyField={(r) => `${r.tipo}-${r.id}`}
        emptyMessage="No hay eventos sanitarios registrados en este período."
      />
    </div>
  );
}
