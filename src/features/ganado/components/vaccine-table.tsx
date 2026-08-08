import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { VacunaRow } from "@/features/ganado/types";
import { formatearFecha } from "@/features/ganado/utils/animal.utils";
import {
  ESTADO_APLICACION_BADGE_CLASS,
  ESTADO_APLICACION_LABEL,
  calcularEstadoAplicacion,
} from "@/features/ganado/utils/salud.utils";
import { cn } from "@/lib/utils";

interface VaccineTableProps {
  vacunas: VacunaRow[];
  onEdit: (vacuna: VacunaRow) => void;
  onDelete: (vacuna: VacunaRow) => void;
}

function EstadoAplicacionBadge({ proximaAplicacion }: { proximaAplicacion: string | null }) {
  const estado = calcularEstadoAplicacion(proximaAplicacion);
  return (
    <Badge
      variant="outline"
      className={cn("border-transparent font-medium", ESTADO_APLICACION_BADGE_CLASS[estado])}
    >
      {ESTADO_APLICACION_LABEL[estado]}
    </Badge>
  );
}

export function VaccineTable({ vacunas, onEdit, onDelete }: VaccineTableProps) {
  return (
    <>
      <div className="hidden overflow-hidden rounded-xl border bg-card md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vacuna</TableHead>
              <TableHead>Fecha de aplicación</TableHead>
              <TableHead>Próxima aplicación</TableHead>
              <TableHead>Dosis</TableHead>
              <TableHead>Veterinario</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="w-12 text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vacunas.map((vacuna) => (
              <TableRow key={vacuna.id}>
                <TableCell className="font-medium">{vacuna.nombre}</TableCell>
                <TableCell>{formatearFecha(vacuna.fecha_aplicacion)}</TableCell>
                <TableCell>{formatearFecha(vacuna.proxima_aplicacion)}</TableCell>
                <TableCell>{vacuna.dosis || "—"}</TableCell>
                <TableCell>{vacuna.veterinario || "—"}</TableCell>
                <TableCell>
                  <EstadoAplicacionBadge proximaAplicacion={vacuna.proxima_aplicacion} />
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={<Button variant="ghost" size="icon-sm" aria-label="Acciones de la vacuna" />}
                    >
                      <MoreHorizontal className="size-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(vacuna)}>
                        <Pencil />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem variant="destructive" onClick={() => onDelete(vacuna)}>
                        <Trash2 />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-3 md:hidden">
        {vacunas.map((vacuna) => (
          <div key={vacuna.id} className="rounded-xl border bg-card p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-medium">{vacuna.nombre}</p>
                <p className="text-xs text-muted-foreground">
                  {formatearFecha(vacuna.fecha_aplicacion)}
                </p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={<Button variant="ghost" size="icon-sm" aria-label="Acciones de la vacuna" />}
                >
                  <MoreHorizontal className="size-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(vacuna)}>
                    <Pencil />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem variant="destructive" onClick={() => onDelete(vacuna)}>
                    <Trash2 />
                    Eliminar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <EstadoAplicacionBadge proximaAplicacion={vacuna.proxima_aplicacion} />
              {vacuna.proxima_aplicacion && (
                <span className="text-xs text-muted-foreground">
                  Próxima: {formatearFecha(vacuna.proxima_aplicacion)}
                </span>
              )}
            </div>
            {(vacuna.dosis || vacuna.veterinario) && (
              <p className="mt-2 text-sm text-muted-foreground">
                {[vacuna.dosis, vacuna.veterinario].filter(Boolean).join(" · ")}
              </p>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
