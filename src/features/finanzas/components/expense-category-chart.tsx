"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatearMoneda } from "@/features/inventario/utils/inventario.utils";
import type { ExpenseCategoryPoint } from "@/features/finanzas/types";
import { formatearMonedaCompacta } from "@/features/finanzas/utils/finanzas.utils";

function ChartTooltip({ active, payload }: { active?: boolean; payload?: { payload: ExpenseCategoryPoint }[] }) {
  if (!active || !payload?.length) return null;
  const punto = payload[0].payload;
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-xs shadow-md">
      <p className="font-medium text-popover-foreground">{punto.categoria}</p>
      <p className="text-muted-foreground">{formatearMoneda(punto.monto)}</p>
    </div>
  );
}

export function ExpenseCategoryChart({ data }: { data: ExpenseCategoryPoint[] }) {
  const conGastos = data.filter((d) => d.monto > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gastos por categoría</CardTitle>
        <CardDescription>Distribución de los gastos del período</CardDescription>
      </CardHeader>
      <CardContent>
        {conGastos.length === 0 ? (
          <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
            No hay gastos registrados en este período.
          </div>
        ) : (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                layout="vertical"
                margin={{ top: 8, right: 24, bottom: 0, left: 12 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value: number) => formatearMonedaCompacta(value)}
                />
                <YAxis
                  type="category"
                  dataKey="categoria"
                  tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
                  axisLine={{ stroke: "var(--color-border)" }}
                  tickLine={false}
                  width={110}
                />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: "var(--color-muted)" }} />
                <Bar dataKey="monto" name="Monto" fill="var(--color-chart-3)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
