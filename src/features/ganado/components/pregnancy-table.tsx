import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { EventoReproductivoRow, GestacionRow } from "@/features/ganado/types";
import { formatearFecha } from "@/features/ganado/utils/animal.utils";
import { ESTADO_GESTACION_BADGE_CLASS, ESTADO_GESTACION_LABEL } from "@/features/ganado/utils/reproduccion.utils";
import { cn } from "@/lib/utils";

interface PregnancyTableProps {
  gestaciones: GestacionRow[];
  eventos: EventoReproductivoRow[];
}

export function PregnancyTable({ gestaciones, eventos }: PregnancyTableProps) {
  function numeroCrias(gestacionId: string): number {
    const parto = eventos.find((e) => e.tipo === "parto" && e.gestacion_id === gestacionId);
    return parto?.numero_crias ?? 0;
  }

  return (
    <>
      <div className="hidden overflow-hidden rounded-xl border bg-card md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Gestación</TableHead>
              <TableHead>Inicio</TableHead>
              <TableHead>Diagnóstico</TableHead>
              <TableHead>Fecha estimada de parto</TableHead>
              <TableHead>Fecha real de parto</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Crías</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {gestaciones.map((gestacion, index) => (
              <TableRow key={gestacion.id}>
                <TableCell className="font-medium">
                  Gestación {gestaciones.length - index}
                </TableCell>
                <TableCell>{formatearFecha(gestacion.fecha_inicio)}</TableCell>
                <TableCell>{formatearFecha(gestacion.fecha_diagnostico)}</TableCell>
                <TableCell>{formatearFecha(gestacion.fecha_estimada_parto)}</TableCell>
                <TableCell>{formatearFecha(gestacion.fecha_parto)}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={cn(
                      "border-transparent font-medium",
                      ESTADO_GESTACION_BADGE_CLASS[gestacion.estado],
                    )}
                  >
                    {ESTADO_GESTACION_LABEL[gestacion.estado]}
                  </Badge>
                </TableCell>
                <TableCell>{numeroCrias(gestacion.id) || "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-3 md:hidden">
        {gestaciones.map((gestacion, index) => (
          <div key={gestacion.id} className="rounded-xl border bg-card p-4">
            <div className="flex items-start justify-between gap-2">
              <p className="font-medium">Gestación {gestaciones.length - index}</p>
              <Badge
                variant="outline"
                className={cn(
                  "border-transparent font-medium",
                  ESTADO_GESTACION_BADGE_CLASS[gestacion.estado],
                )}
              >
                {ESTADO_GESTACION_LABEL[gestacion.estado]}
              </Badge>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Inicio: {formatearFecha(gestacion.fecha_inicio)}
            </p>
            <p className="text-xs text-muted-foreground">
              Fecha estimada de parto: {formatearFecha(gestacion.fecha_estimada_parto)}
            </p>
            {gestacion.fecha_parto && (
              <p className="text-xs text-muted-foreground">
                Parto real: {formatearFecha(gestacion.fecha_parto)}
              </p>
            )}
            {numeroCrias(gestacion.id) > 0 && (
              <p className="mt-1 text-sm">{numeroCrias(gestacion.id)} cría(s)</p>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
