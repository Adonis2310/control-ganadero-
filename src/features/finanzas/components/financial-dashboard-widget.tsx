import Link from "next/link";
import { ShoppingCart, Store, Receipt } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatearMoneda } from "@/features/inventario/utils/inventario.utils";
import type { FinancialSummaryData, OperacionReciente } from "@/features/finanzas/types";
import { formatearFecha } from "@/features/ganado/utils/animal.utils";
import { cn } from "@/lib/utils";

const ICONO_OPERACION = {
  venta: Store,
  compra: ShoppingCart,
  gasto: Receipt,
};

export function FinancialDashboardWidget({
  summary,
  ultimasOperaciones,
}: {
  summary: FinancialSummaryData;
  ultimasOperaciones: OperacionReciente[];
}) {
  const resultadoPositivo = summary.resultadoOperativo >= 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
        <div>
          <CardTitle>Resumen financiero</CardTitle>
          <CardDescription>Ingresos, egresos y resultado del mes</CardDescription>
        </div>
        <Button variant="ghost" size="sm" nativeButton={false} render={<Link href="/finanzas" />}>
          Ver finanzas
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-2 text-center sm:grid-cols-4">
          <div>
            <p className="text-lg font-semibold">{formatearMoneda(summary.ingresos)}</p>
            <p className="text-xs text-muted-foreground">Ingresos</p>
          </div>
          <div>
            <p className="text-lg font-semibold">{formatearMoneda(summary.compras)}</p>
            <p className="text-xs text-muted-foreground">Compras</p>
          </div>
          <div>
            <p className="text-lg font-semibold">{formatearMoneda(summary.gastos)}</p>
            <p className="text-xs text-muted-foreground">Gastos</p>
          </div>
          <div>
            <p
              className={cn(
                "text-lg font-semibold",
                resultadoPositivo ? "text-emerald-600 dark:text-emerald-500" : "text-red-600 dark:text-red-500",
              )}
            >
              {formatearMoneda(summary.resultadoOperativo)}
            </p>
            <p className="text-xs text-muted-foreground">Resultado</p>
          </div>
        </div>

        {ultimasOperaciones.length === 0 ? (
          <p className="text-sm text-muted-foreground">Todavía no hay operaciones registradas.</p>
        ) : (
          <ul className="flex flex-col gap-1.5 border-t pt-3">
            {ultimasOperaciones.map((operacion) => {
              const Icono = ICONO_OPERACION[operacion.tipo];
              return (
                <li key={`${operacion.tipo}-${operacion.id}`} className="flex items-center justify-between gap-2 text-sm">
                  <Link href={operacion.href} className="flex min-w-0 items-center gap-1.5 text-muted-foreground hover:underline">
                    <Icono className="size-3.5 shrink-0" />
                    <span className="truncate">{operacion.descripcion}</span>
                  </Link>
                  <span className="shrink-0 text-xs text-muted-foreground">{formatearFecha(operacion.fecha)}</span>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
