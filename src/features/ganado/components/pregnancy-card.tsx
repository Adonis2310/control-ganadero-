import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { GestacionConMacho } from "@/features/ganado/types";
import { formatearFecha } from "@/features/ganado/utils/animal.utils";
import {
  DURACION_GESTACION_DIAS,
  ESTADO_GESTACION_BADGE_CLASS,
  ESTADO_GESTACION_LABEL,
} from "@/features/ganado/utils/reproduccion.utils";
import { cn } from "@/lib/utils";

const METODO_LABEL: Record<string, string> = {
  monta_natural: "Monta natural",
  monta_controlada: "Monta controlada",
  inseminacion_artificial: "Inseminación artificial",
  desconocido: "Sin registrar",
};

function Campo({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm">{value}</p>
    </div>
  );
}

export function PregnancyCard({ gestacion }: { gestacion: GestacionConMacho }) {
  const hoy = new Date();
  const inicio = new Date(`${gestacion.fecha_inicio}T00:00:00`);
  const diasTranscurridos = Math.max(
    0,
    Math.round((hoy.getTime() - inicio.getTime()) / 86_400_000),
  );
  const progreso =
    gestacion.estado === "confirmada"
      ? Math.min(100, Math.round((diasTranscurridos / DURACION_GESTACION_DIAS) * 100))
      : null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
        <CardTitle>Gestación actual</CardTitle>
        <Badge
          variant="outline"
          className={cn(
            "border-transparent font-medium",
            ESTADO_GESTACION_BADGE_CLASS[gestacion.estado],
          )}
        >
          {ESTADO_GESTACION_LABEL[gestacion.estado]}
        </Badge>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        {progreso !== null && (
          <div className="space-y-1.5">
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary" style={{ width: `${progreso}%` }} />
            </div>
            <p className="text-xs text-muted-foreground">
              Estimado a partir de la duración promedio de la gestación bovina (
              {DURACION_GESTACION_DIAS} días). No es una medición veterinaria exacta.
            </p>
          </div>
        )}

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Campo label="Fecha de inicio" value={formatearFecha(gestacion.fecha_inicio)} />
          <Campo label="Fecha de diagnóstico" value={formatearFecha(gestacion.fecha_diagnostico)} />
          <Campo
            label="Método de concepción"
            value={
              gestacion.metodo_concepcion ? METODO_LABEL[gestacion.metodo_concepcion] : "Sin registrar"
            }
          />
          <Campo
            label="Padre"
            value={
              gestacion.macho
                ? `${gestacion.macho.identificador}${gestacion.macho.nombre ? ` — ${gestacion.macho.nombre}` : ""}`
                : "Sin registrar"
            }
          />
          <Campo
            label="Fecha estimada de parto"
            value={formatearFecha(gestacion.fecha_estimada_parto)}
          />
        </div>
      </CardContent>
    </Card>
  );
}
