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
import type { DesparasitacionRow } from "@/features/ganado/types";
import { formatearFecha } from "@/features/ganado/utils/animal.utils";
import {
  ESTADO_APLICACION_BADGE_CLASS,
  ESTADO_APLICACION_LABEL,
  calcularEstadoAplicacion,
} from "@/features/ganado/utils/salud.utils";
import { cn } from "@/lib/utils";

interface DewormingTableProps {
  desparasitaciones: DesparasitacionRow[];
  onEdit: (desparasitacion: DesparasitacionRow) => void;
  onDelete: (desparasitacion: DesparasitacionRow) => void;
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

export function DewormingTable({ desparasitaciones, onEdit, onDelete }: DewormingTableProps) {
  return (
    <>
      <div className="hidden overflow-hidden rounded-xl border bg-card md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Producto</TableHead>
              <TableHead>Fecha de aplicación</TableHead>
              <TableHead>Próxima aplicación</TableHead>
              <TableHead>Dosis</TableHead>
              <TableHead>Veterinario</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="w-12 text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {desparasitaciones.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.producto}</TableCell>
                <TableCell>{formatearFecha(item.fecha_aplicacion)}</TableCell>
                <TableCell>{formatearFecha(item.proxima_aplicacion)}</TableCell>
                <TableCell>{item.dosis || "—"}</TableCell>
                <TableCell>{item.veterinario || "—"}</TableCell>
                <TableCell>
                  <EstadoAplicacionBadge proximaAplicacion={item.proxima_aplicacion} />
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button variant="ghost" size="icon-sm" aria-label="Acciones de la desparasitación" />
                      }
                    >
                      <MoreHorizontal className="size-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(item)}>
                        <Pencil />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem variant="destructive" onClick={() => onDelete(item)}>
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
        {desparasitaciones.map((item) => (
          <div key={item.id} className="rounded-xl border bg-card p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-medium">{item.producto}</p>
                <p className="text-xs text-muted-foreground">
                  {formatearFecha(item.fecha_aplicacion)}
                </p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button variant="ghost" size="icon-sm" aria-label="Acciones de la desparasitación" />
                  }
                >
                  <MoreHorizontal className="size-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(item)}>
                    <Pencil />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem variant="destructive" onClick={() => onDelete(item)}>
                    <Trash2 />
                    Eliminar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <EstadoAplicacionBadge proximaAplicacion={item.proxima_aplicacion} />
              {item.proxima_aplicacion && (
                <span className="text-xs text-muted-foreground">
                  Próxima: {formatearFecha(item.proxima_aplicacion)}
                </span>
              )}
            </div>
            {(item.dosis || item.veterinario) && (
              <p className="mt-2 text-sm text-muted-foreground">
                {[item.dosis, item.veterinario].filter(Boolean).join(" · ")}
              </p>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
