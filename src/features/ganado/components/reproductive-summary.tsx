import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { ReproductiveSummaryHembra, ReproductiveSummaryMacho } from "@/features/ganado/types";
import { formatearFecha } from "@/features/ganado/utils/animal.utils";
import {
  ESTADO_GESTACION_LABEL,
  ESTADO_REPRODUCTIVO_HEMBRA_BADGE_CLASS,
  ESTADO_REPRODUCTIVO_HEMBRA_LABEL,
  ESTADO_REPRODUCTIVO_MACHO_BADGE_CLASS,
  ESTADO_REPRODUCTIVO_MACHO_LABEL,
} from "@/features/ganado/utils/reproduccion.utils";
import { cn } from "@/lib/utils";

function StatCard({ label, value }: { label: string; value: ReactNode }) {
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

export function ReproductiveSummaryHembraCards({
  resumen,
}: {
  resumen: ReproductiveSummaryHembra;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
      <StatCard
        label="Estado reproductivo"
        value={
          <Badge
            variant="outline"
            className={cn(
              "border-transparent text-sm font-medium",
              ESTADO_REPRODUCTIVO_HEMBRA_BADGE_CLASS[resumen.estado],
            )}
          >
            {ESTADO_REPRODUCTIVO_HEMBRA_LABEL[resumen.estado]}
          </Badge>
        }
      />
      <StatCard label="Último celo" value={formatearFecha(resumen.ultimoCelo)} />
      <StatCard
        label="Última monta/inseminación"
        value={formatearFecha(resumen.ultimaMontaOInseminacion)}
      />
      <StatCard
        label="Estado de gestación"
        value={
          resumen.gestacionActual ? ESTADO_GESTACION_LABEL[resumen.gestacionActual.estado] : "—"
        }
      />
      <StatCard
        label="Fecha estimada de parto"
        value={
          resumen.gestacionActual?.fecha_estimada_parto
            ? formatearFecha(resumen.gestacionActual.fecha_estimada_parto)
            : "—"
        }
      />
      <StatCard label="Partos registrados" value={String(resumen.numeroPartos)} />
      <StatCard label="Crías" value={String(resumen.numeroCrias)} />
    </div>
  );
}

export function ReproductiveSummaryMachoCards({
  resumen,
}: {
  resumen: ReproductiveSummaryMacho;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <StatCard
        label="Estado reproductivo"
        value={
          <Badge
            variant="outline"
            className={cn(
              "border-transparent text-sm font-medium",
              ESTADO_REPRODUCTIVO_MACHO_BADGE_CLASS[resumen.estado],
            )}
          >
            {ESTADO_REPRODUCTIVO_MACHO_LABEL[resumen.estado]}
          </Badge>
        }
      />
      <StatCard label="Montas registradas" value={String(resumen.numeroMontas)} />
      <StatCard label="Crías asociadas" value={String(resumen.numeroCrias)} />
      <StatCard label="Última monta" value={formatearFecha(resumen.ultimaMonta)} />
    </div>
  );
}
