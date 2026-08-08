import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { InventoryStats } from "@/features/inventario/types";
import { formatearMoneda } from "@/features/inventario/utils/inventario.utils";
import { cn } from "@/lib/utils";

function StatCard({ label, value, atencion }: { label: string; value: string; atencion?: boolean }) {
  return (
    <Card className="gap-1.5 py-4">
      <CardHeader className="px-4">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
      </CardHeader>
      <CardContent className="px-4">
        <div className={cn("text-xl font-semibold tracking-tight", atencion && "text-amber-600 dark:text-amber-500")}>
          {value}
        </div>
      </CardContent>
    </Card>
  );
}

export function InventoryStatsCards({ stats }: { stats: InventoryStats }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <StatCard label="Total de productos" value={String(stats.totalProductos)} />
      <StatCard label="Stock bajo" value={String(stats.stockBajo)} atencion={stats.stockBajo > 0} />
      <StatCard label="Agotados" value={String(stats.agotados)} atencion={stats.agotados > 0} />
      <StatCard label="Valor estimado" value={formatearMoneda(stats.valorEstimado)} />
    </div>
  );
}
