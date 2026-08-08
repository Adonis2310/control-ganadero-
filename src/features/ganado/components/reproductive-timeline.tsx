import { Baby, Beaker, Droplet, HeartCrack, MoreHorizontal, Pencil, Search, Syringe, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { EventoReproductivoRow, TipoEventoReproductivo } from "@/features/ganado/types";
import { formatearFecha } from "@/features/ganado/utils/animal.utils";
import { construirTimelineReproductivo } from "@/features/ganado/utils/reproduccion.utils";
import { cn } from "@/lib/utils";

const TIPO_ICON: Record<TipoEventoReproductivo, typeof Syringe> = {
  celo: Search,
  monta: Droplet,
  inseminacion: Syringe,
  diagnostico: Beaker,
  parto: Baby,
  aborto: HeartCrack,
};

const TONO_CLASS: Record<string, string> = {
  neutral: "bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300",
  positivo: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300",
  atencion: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
  negativo: "bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300",
};

interface ReproductiveTimelineProps {
  eventos: EventoReproductivoRow[];
  onEdit?: (evento: EventoReproductivoRow) => void;
  onDelete?: (evento: EventoReproductivoRow) => void;
}

export function ReproductiveTimeline({ eventos, onEdit, onDelete }: ReproductiveTimelineProps) {
  if (eventos.length === 0) return null;
  const registros = construirTimelineReproductivo(eventos);
  const eventosPorId = new Map(eventos.map((e) => [e.id, e]));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historial reproductivo</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-0">
        {registros.map((registro) => {
          const Icon = TIPO_ICON[registro.tipo];
          const evento = eventosPorId.get(registro.id);
          return (
            <div
              key={registro.id}
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
                    className={cn(
                      "border-transparent font-medium",
                      TONO_CLASS[registro.estadoTono],
                    )}
                  >
                    {formatearFecha(registro.fecha)}
                  </Badge>
                </div>
                {registro.detalle && (
                  <p className="text-sm text-muted-foreground">{registro.detalle}</p>
                )}
              </div>
              {evento && (onEdit || onDelete) && (
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={<Button variant="ghost" size="icon-sm" aria-label="Acciones del registro" />}
                  >
                    <MoreHorizontal className="size-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {onEdit && evento.tipo !== "aborto" && (
                      <DropdownMenuItem onClick={() => onEdit(evento)}>
                        <Pencil />
                        Editar
                      </DropdownMenuItem>
                    )}
                    {onDelete && (
                      <DropdownMenuItem variant="destructive" onClick={() => onDelete(evento)}>
                        <Trash2 />
                        Eliminar
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
