import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { ReproduccionGeneralStats } from "@/features/ganado/types";

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

export function ReproduccionGeneralStatsCards({ stats }: { stats: ReproduccionGeneralStats }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      <StatCard label="Hembras" value={String(stats.hembras)} />
      <StatCard label="Hembras gestantes" value={String(stats.hembrasGestantes)} />
      <StatCard label="Hembras en celo" value={String(stats.hembrasEnCelo)} />
      <StatCard label="Partos próximos" value={String(stats.partosProximos)} />
      <StatCard label="Partos registrados" value={String(stats.partosRegistrados)} />
      <StatCard label="Crías nacidas" value={String(stats.criasNacidas)} />
    </div>
  );
}
