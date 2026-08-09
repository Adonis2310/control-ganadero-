"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ReportExport } from "@/features/reportes/components/report-export";
import { ReportTable } from "@/features/reportes/components/report-table";
import type { RangoFechas } from "@/features/finanzas/types";
import type { AnimalRef, PesoConAnimal } from "@/features/ganado/types";
import { formatearFecha, formatearPeso } from "@/features/ganado/utils/animal.utils";
import { calcularPesoStats, calcularVariaciones, formatearVariacion } from "@/features/ganado/utils/peso.utils";
import { calcularWeightReportStats } from "@/features/reportes/utils/reportes.utils";

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

function PesoTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-xs shadow-md">
      <p className="mb-1 font-medium text-popover-foreground">{formatearFecha(label ?? null)}</p>
      <p className="text-muted-foreground">{formatearPeso(payload[0].value)}</p>
    </div>
  );
}

interface WeightReportProps {
  pesos: PesoConAnimal[];
  animales: AnimalRef[];
  rango: RangoFechas;
  periodoLabel: string;
}

export function WeightReport({ pesos, animales, rango, periodoLabel }: WeightReportProps) {
  const [animalId, setAnimalId] = useState<string>("");

  const stats = useMemo(() => calcularWeightReportStats(pesos, rango), [pesos, rango]);
  const pesosEnRango = useMemo(() => pesos.filter((p) => p.fecha >= rango.desde && p.fecha <= rango.hasta), [pesos, rango]);

  const animalesConPesajes = useMemo(() => {
    const ids = new Set(pesos.map((p) => p.animal_id));
    return animales.filter((a) => ids.has(a.id));
  }, [pesos, animales]);

  const pesosDelAnimal = useMemo(
    () => (animalId ? calcularVariaciones(pesos.filter((p) => p.animal_id === animalId)) : []),
    [pesos, animalId],
  );
  const statsAnimal = useMemo(() => calcularPesoStats(pesos.filter((p) => p.animal_id === animalId)), [pesos, animalId]);
  const animalSeleccionado = animales.find((a) => a.id === animalId);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h3 className="text-lg font-semibold">Análisis de Peso</h3>
          <p className="text-sm text-muted-foreground">Evolución del peso del hato y de cada animal.</p>
        </div>
        <div className="flex items-center gap-2 print:hidden">
          <Button variant="ghost" size="sm" nativeButton={false} render={<Link href="/ganado/peso" />}>
            Ir a Control de Peso
          </Button>
          <ReportExport
            titulo="Análisis de Peso"
            periodoLabel={periodoLabel}
            columnas={[
              { header: "Fecha", accessor: (p: PesoConAnimal) => formatearFecha(p.fecha) },
              { header: "Animal", accessor: (p: PesoConAnimal) => p.animal?.identificador ?? "" },
              { header: "Peso", accessor: (p: PesoConAnimal) => formatearPeso(p.peso) },
            ]}
            filas={pesosEnRango}
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Peso promedio (período)" value={formatearPeso(stats.pesoPromedio)} />
        <Stat label="Peso máximo (período)" value={formatearPeso(stats.pesoMaximo)} />
        <Stat label="Peso mínimo (período)" value={formatearPeso(stats.pesoMinimo)} />
        <Stat label="Animales pesados (período)" value={String(stats.animalesPesados)} />
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <p className="font-medium">Evolución de peso por animal</p>
              <p className="text-sm text-muted-foreground">Selecciona un animal para ver su historial completo.</p>
            </div>
            <Select value={animalId || "ninguno"} onValueChange={(value) => setAnimalId(value === "ninguno" ? "" : (value ?? ""))}>
              <SelectTrigger className="w-full sm:w-56">
                <SelectValue placeholder="Selecciona un animal">
                  {(current: string | null) => {
                    if (!current || current === "ninguno") return "Selecciona un animal";
                    const animal = animales.find((a) => a.id === current);
                    return animal ? `${animal.identificador}${animal.nombre ? ` — ${animal.nombre}` : ""}` : "Selecciona un animal";
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ninguno">Selecciona un animal</SelectItem>
                {animalesConPesajes.map((animal) => (
                  <SelectItem key={animal.id} value={animal.id}>
                    {animal.identificador}
                    {animal.nombre ? ` — ${animal.nombre}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {!animalId ? (
            <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
              Selecciona un animal para consultar su evolución de peso.
            </div>
          ) : pesosDelAnimal.length === 0 ? (
            <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
              {animalSeleccionado?.identificador} no tiene pesajes registrados.
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-lg font-semibold">{formatearPeso(statsAnimal.pesoInicial)}</p>
                  <p className="text-xs text-muted-foreground">Peso inicial</p>
                </div>
                <div>
                  <p className="text-lg font-semibold">{formatearPeso(statsAnimal.pesoActual)}</p>
                  <p className="text-xs text-muted-foreground">Peso actual</p>
                </div>
                <div>
                  <p className="text-lg font-semibold">{formatearVariacion(statsAnimal.gananciaTotalKg)}</p>
                  <p className="text-xs text-muted-foreground">Variación</p>
                </div>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={pesosDelAnimal} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                    <XAxis
                      dataKey="fecha"
                      tickFormatter={(value: string) => formatearFecha(value)}
                      tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
                      axisLine={{ stroke: "var(--color-border)" }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                      width={48}
                      domain={["dataMin - 5", "dataMax + 5"]}
                    />
                    <Tooltip content={<PesoTooltip />} />
                    <Line type="monotone" dataKey="peso" stroke="var(--color-chart-2)" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <ReportTable
        columns={[
          { header: "Fecha", cell: (p: PesoConAnimal) => formatearFecha(p.fecha) },
          { header: "Animal", cell: (p: PesoConAnimal) => p.animal?.identificador ?? "—" },
          { header: "Peso", cell: (p: PesoConAnimal) => formatearPeso(p.peso) },
        ]}
        rows={pesosEnRango}
        keyField={(p) => p.id}
        emptyMessage="No hay pesajes registrados en este período."
      />
    </div>
  );
}
