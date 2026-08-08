import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { SalesStats } from "@/features/ventas/types";
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

export function SaleStatsCards({ stats }: { stats: SalesStats }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      <StatCard label="Total vendido" value={formatearMoneda(stats.totalVendido)} />
      <StatCard label="Ventas del mes" value={String(stats.ventasDelMes)} />
      <StatCard label="Completadas" value={String(stats.completadas)} />
      <StatCard label="Pendientes" value={String(stats.pendientes)} />
      <StatCard label="Animales vendidos" value={String(stats.animalesVendidos)} />
      <StatCard label="Productos vendidos" value={String(stats.productosVendidos)} />
    </div>
  );
}
