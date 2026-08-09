import Link from "next/link";
import { ArrowRight, Beef } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ActividadConAnimal } from "@/features/calendario/types";
import { formatearFechaActividad, formatearHora } from "@/features/calendario/utils/actividad.utils";

function Campo({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="text-sm">{value}</p>
    </div>
  );
}

export function ActivityDetail({ actividad }: { actividad: ActividadConAnimal }) {
  const hora = formatearHora(actividad.hora_inicio);
  const horaFin = formatearHora(actividad.hora_fin);

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Detalles</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Campo label="Fecha" value={formatearFechaActividad(actividad.fecha)} />
          <Campo label="Horario" value={hora ? `${hora}${horaFin ? ` – ${horaFin}` : ""}` : "Sin especificar"} />
          <div className="space-y-1 sm:col-span-2">
            <p className="text-xs font-medium text-muted-foreground">Descripción</p>
            <p className="text-sm whitespace-pre-line">{actividad.descripcion || "Sin descripción."}</p>
          </div>
          <Campo label="Creada" value={new Date(actividad.created_at).toLocaleString("es")} />
          <Campo label="Última actualización" value={new Date(actividad.updated_at).toLocaleString("es")} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Animal asociado</CardTitle>
        </CardHeader>
        <CardContent>
          {actividad.animal ? (
            <Link
              href={`/ganado/${actividad.animal.id}`}
              className="flex items-center justify-between gap-3 rounded-lg border p-3 text-sm transition-colors hover:bg-muted/50"
            >
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-full bg-muted">
                  <Beef className="size-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">
                    {actividad.animal.identificador}
                    {actividad.animal.nombre ? ` — ${actividad.animal.nombre}` : ""}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    <Badge variant="outline">{actividad.animal.sexo === "macho" ? "Macho" : "Hembra"}</Badge>
                    {actividad.animal.raza && <Badge variant="outline">{actividad.animal.raza}</Badge>}
                  </div>
                </div>
              </div>
              <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
            </Link>
          ) : (
            <p className="text-sm text-muted-foreground">Esta actividad no está asociada a ningún animal.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
