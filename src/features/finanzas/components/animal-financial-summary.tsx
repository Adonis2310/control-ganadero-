import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatearMoneda } from "@/features/inventario/utils/inventario.utils";
import type { GastoConReferencias } from "@/features/finanzas/types";
import { calcularAnimalFinancialStats } from "@/features/finanzas/utils/finanzas.utils";
import { formatearFecha } from "@/features/ganado/utils/animal.utils";

export function AnimalFinancialSummary({ gastos }: { gastos: GastoConReferencias[] }) {
  const stats = calcularAnimalFinancialStats(gastos);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Información económica</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Gastos registrados</p>
            <p className="mt-1 text-sm font-medium">{stats.cantidadGastos}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Total</p>
            <p className="mt-1 text-sm font-medium">{formatearMoneda(stats.totalGastado)}</p>
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">Últimos gastos</p>
          <ul className="flex flex-col gap-1.5">
            {stats.ultimosGastos.map((gasto) => (
              <li key={gasto.id} className="flex items-center justify-between gap-2 text-sm">
                <span className="truncate text-muted-foreground">
                  {gasto.descripcion} · {formatearFecha(gasto.fecha)}
                </span>
                <span className="shrink-0 font-medium">{formatearMoneda(gasto.monto)}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
