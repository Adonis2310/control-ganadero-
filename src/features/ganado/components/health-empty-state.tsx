import { HeartPulse } from "lucide-react";

import { Button } from "@/components/ui/button";

interface HealthEmptyStateProps {
  onRegistrarVacuna: () => void;
  onRegistrarDesparasitacion: () => void;
  onRegistrarEnfermedad: () => void;
}

export function HealthEmptyState({
  onRegistrarVacuna,
  onRegistrarDesparasitacion,
  onRegistrarEnfermedad,
}: HealthEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-16 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-muted">
        <HeartPulse className="size-5 text-muted-foreground" />
      </div>
      <div className="space-y-1">
        <p className="font-medium">No hay registros sanitarios para este animal.</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          Empieza registrando una vacuna, una desparasitación o una enfermedad.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        <Button variant="outline" onClick={onRegistrarVacuna}>
          + Registrar vacuna
        </Button>
        <Button variant="outline" onClick={onRegistrarDesparasitacion}>
          + Registrar desparasitación
        </Button>
        <Button variant="outline" onClick={onRegistrarEnfermedad}>
          + Registrar enfermedad
        </Button>
      </div>
    </div>
  );
}
