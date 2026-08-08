import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { GestacionActivaFinca } from "@/features/ganado/types";
import { formatearFecha } from "@/features/ganado/utils/animal.utils";
import { ESTADO_GESTACION_BADGE_CLASS, ESTADO_GESTACION_LABEL } from "@/features/ganado/utils/reproduccion.utils";
import { cn } from "@/lib/utils";

export function ReproduccionActivePregnancies({
  gestaciones,
}: {
  gestaciones: GestacionActivaFinca[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestaciones activas</CardTitle>
      </CardHeader>
      <CardContent>
        {gestaciones.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No hay gestaciones activas en este momento.
          </p>
        ) : (
          <div className="flex flex-col gap-1">
            {gestaciones.map((gestacion) => (
              <Link
                key={gestacion.id}
                href={`/ganado/${gestacion.animal.id}`}
                className="flex items-center justify-between gap-2 rounded-lg px-2 py-2 text-sm transition-colors hover:bg-muted/50"
              >
                <div>
                  <p className="font-medium">
                    {gestacion.animal.identificador}
                    {gestacion.animal.nombre ? ` — ${gestacion.animal.nombre}` : ""}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Inicio: {formatearFecha(gestacion.fecha_inicio)} · Estimado:{" "}
                    {formatearFecha(gestacion.fecha_estimada_parto)}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={cn(
                    "border-transparent font-medium",
                    ESTADO_GESTACION_BADGE_CLASS[gestacion.estado],
                  )}
                >
                  {ESTADO_GESTACION_LABEL[gestacion.estado]}
                </Badge>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
