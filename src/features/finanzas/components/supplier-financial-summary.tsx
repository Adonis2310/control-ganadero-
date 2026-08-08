import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatearMoneda } from "@/features/inventario/utils/inventario.utils";
import type { SupplierFinancialStats } from "@/features/finanzas/types";

function Campo({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm">{value}</p>
    </div>
  );
}

export function SupplierFinancialSummary({ stats }: { stats: SupplierFinancialStats }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Gastos asociados</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-5 sm:grid-cols-2">
        <Campo label="Cantidad de gastos" value={String(stats.cantidadGastos)} />
        <Campo label="Total de gastos" value={formatearMoneda(stats.totalGastos)} />
      </CardContent>
    </Card>
  );
}
