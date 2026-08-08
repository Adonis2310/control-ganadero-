import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { HealthDashboardAlerts } from "@/features/ganado/types";
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

export function SaludGeneralStats({ alertas }: { alertas: HealthDashboardAlerts }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      <StatCard
        label="Animales con enfermedad activa"
        value={String(alertas.animalesConEnfermedadActiva)}
        atencion={alertas.animalesConEnfermedadActiva > 0}
      />
      <StatCard
        label="Vacunas próximas"
        value={String(alertas.vacunasProximas)}
        atencion={alertas.vacunasProximas > 0}
      />
      <StatCard
        label="Vacunas vencidas"
        value={String(alertas.vacunasVencidas)}
        atencion={alertas.vacunasVencidas > 0}
      />
      <StatCard
        label="Desparasitaciones próximas"
        value={String(alertas.desparasitacionesProximas)}
        atencion={alertas.desparasitacionesProximas > 0}
      />
      <StatCard
        label="Desparasitaciones vencidas"
        value={String(alertas.desparasitacionesVencidas)}
        atencion={alertas.desparasitacionesVencidas > 0}
      />
    </div>
  );
}
