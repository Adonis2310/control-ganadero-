import { AlertTriangle, CheckCircle2, TrendingDown } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatearMoneda } from "@/features/inventario/utils/inventario.utils";

interface FinancialAlertsProps {
  resultadoOperativo: number;
  alertaGastos: { alerta: boolean; actual: number; anterior: number };
}

export function FinancialAlerts({ resultadoOperativo, alertaGastos }: FinancialAlertsProps) {
  const resultadoNegativo = resultadoOperativo < 0;
  const hayAlertas = resultadoNegativo || alertaGastos.alerta;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Alertas financieras</CardTitle>
        <CardDescription>Señales a revisar en el período seleccionado</CardDescription>
      </CardHeader>
      <CardContent>
        {!hayAlertas ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-500" />
            No hay alertas financieras en este período.
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {resultadoNegativo && (
              <li className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm dark:border-red-500/20 dark:bg-red-500/10">
                <TrendingDown className="mt-0.5 size-4 shrink-0 text-red-600 dark:text-red-500" />
                <div>
                  <p className="font-medium text-red-700 dark:text-red-400">Resultado operativo negativo</p>
                  <p className="text-red-600/90 dark:text-red-400/80">
                    Los egresos superaron a los ingresos en {formatearMoneda(Math.abs(resultadoOperativo))}.
                  </p>
                </div>
              </li>
            )}
            {alertaGastos.alerta && (
              <li className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm dark:border-amber-500/20 dark:bg-amber-500/10">
                <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-500" />
                <div>
                  <p className="font-medium text-amber-700 dark:text-amber-400">Gastos elevados</p>
                  <p className="text-amber-600/90 dark:text-amber-400/80">
                    Los gastos de este período ({formatearMoneda(alertaGastos.actual)}) superaron a los del
                    período inmediatamente anterior de la misma duración ({formatearMoneda(alertaGastos.anterior)}).
                  </p>
                </div>
              </li>
            )}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
