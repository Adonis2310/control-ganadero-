import { Bug, Pill, Stethoscope, Syringe } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { RegistroSalud, TipoRegistroSalud } from "@/features/ganado/types";
import { formatearFecha } from "@/features/ganado/utils/animal.utils";
import { TIPO_REGISTRO_LABEL } from "@/features/ganado/utils/salud.utils";
import { cn } from "@/lib/utils";

const TIPO_ICON: Record<TipoRegistroSalud, typeof Syringe> = {
  vacuna: Syringe,
  desparasitacion: Bug,
  enfermedad: Stethoscope,
  tratamiento: Pill,
};

const TONO_CLASS: Record<RegistroSalud["estadoTono"], string> = {
  neutral: "bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300",
  positivo: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300",
  atencion: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
  negativo: "bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300",
};

export function HealthTimeline({
  registros,
  mostrarAnimal = false,
}: {
  registros: RegistroSalud[];
  mostrarAnimal?: boolean;
}) {
  if (registros.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historial sanitario</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-0">
        {registros.map((registro) => {
          const Icon = TIPO_ICON[registro.tipo];
          return (
            <div
              key={`${registro.tipo}-${registro.id}`}
              className="flex items-start gap-3 border-b py-3 last:border-b-0 last:pb-0"
            >
              <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
                <Icon className="size-4 text-muted-foreground" />
              </div>
              <div className="flex-1 space-y-0.5">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium">{registro.titulo}</p>
                  <Badge
                    variant="outline"
                    className={cn("border-transparent font-medium", TONO_CLASS[registro.estadoTono])}
                  >
                    {registro.estadoLabel}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {TIPO_REGISTRO_LABEL[registro.tipo]}
                  {mostrarAnimal && registro.animal
                    ? ` · ${registro.animal.identificador}${registro.animal.nombre ? ` — ${registro.animal.nombre}` : ""}`
                    : ""}{" "}
                  · {formatearFecha(registro.fecha)}
                </p>
                {registro.detalle && (
                  <p className="text-sm text-muted-foreground">{registro.detalle}</p>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
