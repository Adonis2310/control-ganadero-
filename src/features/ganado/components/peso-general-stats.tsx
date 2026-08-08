import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { PesoGeneralStats } from "@/features/ganado/types";

function StatCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <Card className="gap-1.5 py-4">
      <CardHeader className="px-4">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
      </CardHeader>
      <CardContent className="px-4">
        <div className="text-xl font-semibold tracking-tight">{value}</div>
        {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
      </CardContent>
    </Card>
  );
}

export function PesoGeneralStatsCards({ stats }: { stats: PesoGeneralStats }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <StatCard label="Total de pesajes" value={String(stats.totalPesajes)} />
      <StatCard
        label="Peso promedio del hato"
        value={stats.pesoPromedioHato !== null ? `${stats.pesoPromedioHato} kg` : "—"}
      />
      <StatCard
        label="Mayor peso"
        value={stats.animalMayorPeso ? `${stats.animalMayorPeso.peso} kg` : "—"}
        hint={
          stats.animalMayorPeso
            ? stats.animalMayorPeso.nombre ?? stats.animalMayorPeso.identificador
            : undefined
        }
      />
      <StatCard
        label="Menor peso"
        value={stats.animalMenorPeso ? `${stats.animalMenorPeso.peso} kg` : "—"}
        hint={
          stats.animalMenorPeso
            ? stats.animalMenorPeso.nombre ?? stats.animalMenorPeso.identificador
            : undefined
        }
      />
    </div>
  );
}
