import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { AnimalHealthSummary } from "@/features/ganado/types";
import { cn } from "@/lib/utils";

function StatCard({
  label,
  value,
  atencion,
}: {
  label: string;
  value: string;
  atencion?: boolean;
}) {
  return (
    <Card className="gap-1.5 py-4">
      <CardHeader className="px-4">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
      </CardHeader>
      <CardContent className="px-4">
        <div
          className={cn(
            "text-xl font-semibold tracking-tight",
            atencion && "text-amber-600 dark:text-amber-500",
          )}
        >
          {value}
        </div>
      </CardContent>
    </Card>
  );
}

export function HealthSummary({ summary }: { summary: AnimalHealthSummary }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      <StatCard label="Vacunas aplicadas" value={String(summary.vacunasAplicadas)} />
      <StatCard
        label="Próximas vacunas"
        value={String(summary.vacunasProximas)}
        atencion={summary.vacunasProximas > 0}
      />
      <StatCard label="Desparasitaciones" value={String(summary.desparasitaciones)} />
      <StatCard
        label="Enfermedades activas"
        value={String(summary.enfermedadesActivas)}
        atencion={summary.enfermedadesActivas > 0}
      />
      <StatCard label="Tratamientos activos" value={String(summary.tratamientosActivos)} />
    </div>
  );
}
