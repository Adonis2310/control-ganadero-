import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { PesoStats } from "@/features/ganado/types";
import { formatearVariacion } from "@/features/ganado/utils/peso.utils";

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "up" | "down";
}) {
  return (
    <Card className="gap-1.5 py-4">
      <CardHeader className="px-4">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
      </CardHeader>
      <CardContent className="px-4">
        <div
          className={
            "text-xl font-semibold tracking-tight " +
            (tone === "up"
              ? "text-emerald-600 dark:text-emerald-500"
              : tone === "down"
                ? "text-red-600 dark:text-red-500"
                : "")
          }
        >
          {value}
        </div>
      </CardContent>
    </Card>
  );
}

export function PesoStatsCards({ stats }: { stats: PesoStats }) {
  const gananciaTone =
    stats.gananciaTotalKg === null ? undefined : stats.gananciaTotalKg >= 0 ? "up" : "down";

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
      <StatCard
        label="Peso actual"
        value={stats.pesoActual !== null ? `${stats.pesoActual} kg` : "—"}
      />
      <StatCard
        label="Peso inicial"
        value={stats.pesoInicial !== null ? `${stats.pesoInicial} kg` : "—"}
      />
      <StatCard
        label="Mayor peso"
        value={stats.pesoMaximo !== null ? `${stats.pesoMaximo} kg` : "—"}
      />
      <StatCard
        label="Menor peso"
        value={stats.pesoMinimo !== null ? `${stats.pesoMinimo} kg` : "—"}
      />
      <StatCard
        label="Ganancia total"
        value={formatearVariacion(stats.gananciaTotalKg)}
        tone={gananciaTone}
      />
      <StatCard
        label="Ganancia promedio"
        value={
          stats.gananciaPromedioKg !== null
            ? formatearVariacion(stats.gananciaPromedioKg)
            : "Sin datos suficientes"
        }
      />
      <StatCard label="Pesajes registrados" value={String(stats.cantidadPesajes)} />
    </div>
  );
}
