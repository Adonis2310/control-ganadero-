import { ArrowDownCircle, Baby, Beef, DollarSign, Receipt, Scale, ShoppingCart } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatearMoneda } from "@/features/inventario/utils/inventario.utils";
import type { ResumenGeneralData } from "@/features/reportes/types";
import { cn } from "@/lib/utils";

export function ReportSummaryCards({ resumen }: { resumen: ResumenGeneralData }) {
  const cards = [
    { label: "Total de animales", value: String(resumen.totalAnimales), icon: Beef },
    { label: "Nacimientos", value: String(resumen.nacimientos), icon: Baby },
    { label: "Animales vendidos", value: String(resumen.animalesVendidos), icon: ArrowDownCircle },
    { label: "Ingresos", value: formatearMoneda(resumen.ingresos), icon: DollarSign },
    { label: "Compras", value: formatearMoneda(resumen.compras), icon: ShoppingCart },
    { label: "Gastos", value: formatearMoneda(resumen.gastos), icon: Receipt },
  ];

  const resultadoPositivo = resumen.resultadoOperativo >= 0;

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.label} className="gap-3">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
            <span className="text-sm font-medium text-muted-foreground">{card.label}</span>
            <div className="flex size-8 items-center justify-center rounded-lg bg-muted">
              <card.icon className="size-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold tracking-tight">{card.value}</div>
          </CardContent>
        </Card>
      ))}

      <Card className="gap-3">
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
            {formatearMoneda(resumen.resultadoOperativo)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
