"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PesoRow } from "@/features/ganado/types";

function formatFechaCorta(fecha: string): string {
  return new Date(`${fecha}T00:00:00`).toLocaleDateString("es", {
    day: "2-digit",
    month: "short",
  });
}

interface PesoChartTooltipProps {
  active?: boolean;
  payload?: { payload: { fecha: string; peso: number } }[];
}

function ChartTooltip({ active, payload }: PesoChartTooltipProps) {
  if (!active || !payload?.length) return null;
  const punto = payload[0].payload;
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-xs shadow-md">
      <p className="font-medium text-popover-foreground">{punto.peso} kg</p>
      <p className="text-muted-foreground">{formatFechaCorta(punto.fecha)}</p>
    </div>
  );
}

export function PesoChart({ pesos }: { pesos: PesoRow[] }) {
  const data = [...pesos]
    .sort((a, b) => a.fecha.localeCompare(b.fecha))
    .map((p) => ({ fecha: p.fecha, peso: p.peso }));

  const valores = data.map((d) => d.peso);
  const min = Math.min(...valores);
  const max = Math.max(...valores);
  // Deja un margen del 10% (o 5 kg si el rango es muy chico) para que la
  // línea no quede pegada a los bordes del gráfico.
  const margen = Math.max((max - min) * 0.1, 5);
  const dominio: [number, number] = [
    Math.max(0, Math.floor(min - margen)),
    Math.ceil(max + margen),
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Evolución del peso</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: -12 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis
                dataKey="fecha"
                tickFormatter={formatFechaCorta}
                tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
                axisLine={{ stroke: "var(--color-border)" }}
                tickLine={false}
              />
              <YAxis
                domain={dominio}
                tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                width={64}
                tickFormatter={(value: number) => `${Math.round(value)} kg`}
              />
              <Tooltip content={<ChartTooltip />} />
              <Line
                type="monotone"
                dataKey="peso"
                stroke="var(--color-primary)"
                strokeWidth={2}
                dot={{ r: 3, fill: "var(--color-primary)" }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
