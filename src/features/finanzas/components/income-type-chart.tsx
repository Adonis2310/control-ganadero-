"use client";

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatearMoneda } from "@/features/inventario/utils/inventario.utils";
import type { IncomeTypePoint } from "@/features/finanzas/types";

const COLORS = ["var(--color-chart-1)", "var(--color-chart-4)", "var(--color-chart-5)"];

function ChartTooltip({ active, payload }: { active?: boolean; payload?: { payload: IncomeTypePoint }[] }) {
  if (!active || !payload?.length) return null;
  const punto = payload[0].payload;
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-xs shadow-md">
      <p className="font-medium text-popover-foreground">{punto.label}</p>
      <p className="text-muted-foreground">{formatearMoneda(punto.monto)}</p>
    </div>
  );
}

export function IncomeTypeChart({ data }: { data: IncomeTypePoint[] }) {
  const conIngresos = data.filter((d) => d.monto > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ingresos por tipo</CardTitle>
        <CardDescription>Animales, productos y otros conceptos vendidos</CardDescription>
      </CardHeader>
      <CardContent>
        {conIngresos.length === 0 ? (
          <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
            No hay ingresos registrados en este período.
          </div>
        ) : (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={conIngresos}
                  dataKey="monto"
                  nameKey="label"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  paddingAngle={2}
                >
                  {conIngresos.map((entry, index) => (
                    <Cell key={entry.tipo} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
