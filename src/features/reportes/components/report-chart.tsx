"use client";

import type { ReactElement } from "react";
import { ResponsiveContainer } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatearMoneda } from "@/features/inventario/utils/inventario.utils";

interface MoneyTooltipPayloadItem {
  value: number;
}

/** Tooltip de un solo valor monetario (mes → monto), reutilizado por los gráficos de Compras/Ventas/Gastos por período. */
export function MoneyBarTooltip({ active, payload, label }: { active?: boolean; payload?: MoneyTooltipPayloadItem[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-xs shadow-md">
      <p className="mb-1 font-medium text-popover-foreground">{label}</p>
      <p className="text-muted-foreground">{formatearMoneda(payload[0].value)}</p>
    </div>
  );
}

interface ReportChartProps {
  title: string;
  description?: string;
  isEmpty: boolean;
  emptyMessage?: string;
  children: ReactElement;
}

/** Envoltorio reutilizable para los gráficos de Reportes: Card + tamaño fijo + estado vacío, igual que los gráficos de Finanzas. */
export function ReportChart({ title, description, isEmpty, emptyMessage = "No hay datos suficientes para este período.", children }: ReportChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {isEmpty ? (
          <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">{emptyMessage}</div>
        ) : (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              {children}
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
