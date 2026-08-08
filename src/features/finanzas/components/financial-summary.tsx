import { ArrowDownCircle, ArrowUpCircle, Receipt, Scale, ShoppingCart } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatearMoneda } from "@/features/inventario/utils/inventario.utils";
import type { FinancialSummaryData } from "@/features/finanzas/types";
import { cn } from "@/lib/utils";

export function FinancialSummary({ summary }: { summary: FinancialSummaryData }) {
  const cards = [
    { label: "Ingresos", value: summary.ingresos, icon: ArrowUpCircle },
    { label: "Compras", value: summary.compras, icon: ShoppingCart },
    { label: "Gastos", value: summary.gastos, icon: Receipt },
    { label: "Egresos totales", value: summary.egresosTotales, icon: ArrowDownCircle },
  ];

  const resultadoPositivo = summary.resultadoOperativo >= 0;

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {cards.map((card) => (
        <Card key={card.label} className="gap-3">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
            <span className="text-sm font-medium text-muted-foreground">{card.label}</span>
            <div className="flex size-8 items-center justify-center rounded-lg bg-muted">
              <card.icon className="size-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold tracking-tight">{formatearMoneda(card.value)}</div>
          </CardContent>
        </Card>
      ))}

      <Card className="gap-3 xl:col-span-1">
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
          <span className="text-sm font-medium text-muted-foreground">Resultado operativo estimado</span>
          <div className="flex size-8 items-center justify-center rounded-lg bg-muted">
            <Scale className="size-4 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <div
            className={cn(
              "text-2xl font-semibold tracking-tight",
              resultadoPositivo ? "text-emerald-600 dark:text-emerald-500" : "text-red-600 dark:text-red-500",
            )}
          >
            {formatearMoneda(summary.resultadoOperativo)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
