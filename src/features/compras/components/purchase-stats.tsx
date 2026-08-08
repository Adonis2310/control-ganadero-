import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { PurchaseStats } from "@/features/compras/types";
import { formatearMoneda } from "@/features/inventario/utils/inventario.utils";

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className="gap-1.5 py-4">
      <CardHeader className="px-4">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
      </CardHeader>
      <CardContent className="px-4">
        <div className="text-xl font-semibold tracking-tight">{value}</div>
      </CardContent>
    </Card>
  );
}

export function PurchaseStatsCards({ stats }: { stats: PurchaseStats }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      <StatCard label="Total de compras" value={String(stats.totalCompras)} />
      <StatCard label="Total gastado" value={formatearMoneda(stats.totalGastado)} />
      <StatCard label="Pendientes" value={String(stats.pendientes)} />
      <StatCard label="Recibidas" value={String(stats.recibidas)} />
      <StatCard label="Compras del mes" value={String(stats.comprasDelMes)} />
    </div>
  );
}
