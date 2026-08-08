"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatearMoneda } from "@/features/inventario/utils/inventario.utils";
import type { IncomeExpenseMonthPoint } from "@/features/finanzas/types";
import { formatearMonedaCompacta } from "@/features/finanzas/utils/finanzas.utils";

interface TooltipPayloadItem {
  name: string;
  value: number;
  color: string;
}

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: TooltipPayloadItem[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-xs shadow-md">
      <p className="mb-1 font-medium text-popover-foreground">{label}</p>
      {payload.map((item) => (
        <p key={item.name} className="flex items-center gap-1.5" style={{ color: item.color }}>
          {item.name}: {formatearMoneda(item.value)}
        </p>
      ))}
    </div>
  );
}

export function IncomeExpenseChart({ data }: { data: IncomeExpenseMonthPoint[] }) {
  const sinDatos = data.every((d) => d.ingresos === 0 && d.compras === 0 && d.gastos === 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ingresos y egresos</CardTitle>
        <CardDescription>Comparación mensual de ingresos, compras y gastos</CardDescription>
      </CardHeader>
      <CardContent>
        {sinDatos ? (
          <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
            No hay movimientos registrados en este período.
          </div>
        ) : (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis
                  dataKey="mesLabel"
                  tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
                  axisLine={{ stroke: "var(--color-border)" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  width={56}
                  tickFormatter={(value: number) => formatearMonedaCompacta(value)}
                />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: "var(--color-muted)" }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="ingresos" name="Ingresos" fill="var(--color-chart-1)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="compras" name="Compras" fill="var(--color-chart-2)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="gastos" name="Gastos" fill="var(--color-chart-3)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
