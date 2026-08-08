import { CheckCircle2, MoreHorizontal, Pencil, Trash2 } from "lucide-react";

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
import type { EnfermedadRow } from "@/features/ganado/types";
import { formatearFecha } from "@/features/ganado/utils/animal.utils";
import { ESTADO_ENFERMEDAD_BADGE_CLASS, ESTADO_ENFERMEDAD_LABEL } from "@/features/ganado/utils/salud.utils";
import { cn } from "@/lib/utils";

interface DiseaseTableProps {
  enfermedades: EnfermedadRow[];
  onEdit: (enfermedad: EnfermedadRow) => void;
  onDelete: (enfermedad: EnfermedadRow) => void;
  onRecuperar: (enfermedad: EnfermedadRow) => void;
}

function EstadoEnfermedadBadge({ estado }: { estado: EnfermedadRow["estado"] }) {
  return (
    <Badge
      variant="outline"
      className={cn("border-transparent font-medium", ESTADO_ENFERMEDAD_BADGE_CLASS[estado])}
    >
      {ESTADO_ENFERMEDAD_LABEL[estado]}
    </Badge>
  );
}

export function DiseaseTable({ enfermedades, onEdit, onDelete, onRecuperar }: DiseaseTableProps) {
  return (
    <>
      <div className="hidden overflow-hidden rounded-xl border bg-card md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Enfermedad</TableHead>
              <TableHead>Fecha de diagnóstico</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Fecha de recuperación</TableHead>
              <TableHead>Veterinario</TableHead>
              <TableHead className="w-12 text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {enfermedades.map((enfermedad) => (
              <TableRow
                key={enfermedad.id}
                className={enfermedad.estado === "activa" ? "bg-red-50/60 dark:bg-red-500/5" : undefined}
              >
                <TableCell className="font-medium">{enfermedad.enfermedad}</TableCell>
                <TableCell>{formatearFecha(enfermedad.fecha_diagnostico)}</TableCell>
                <TableCell>
                  <EstadoEnfermedadBadge estado={enfermedad.estado} />
                </TableCell>
                <TableCell>{formatearFecha(enfermedad.fecha_recuperacion)}</TableCell>
                <TableCell>{enfermedad.veterinario || "—"}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={<Button variant="ghost" size="icon-sm" aria-label="Acciones de la enfermedad" />}
                    >
                      <MoreHorizontal className="size-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {enfermedad.estado === "activa" && (
                        <DropdownMenuItem onClick={() => onRecuperar(enfermedad)}>
                          <CheckCircle2 />
                          Marcar como recuperada
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => onEdit(enfermedad)}>
                        <Pencil />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem variant="destructive" onClick={() => onDelete(enfermedad)}>
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
        {enfermedades.map((enfermedad) => (
          <div
            key={enfermedad.id}
            className={cn(
              "rounded-xl border bg-card p-4",
              enfermedad.estado === "activa" && "border-red-200 bg-red-50/60 dark:border-red-500/20 dark:bg-red-500/5",
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-medium">{enfermedad.enfermedad}</p>
                <p className="text-xs text-muted-foreground">
                  Diagnóstico: {formatearFecha(enfermedad.fecha_diagnostico)}
                </p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={<Button variant="ghost" size="icon-sm" aria-label="Acciones de la enfermedad" />}
                >
                  <MoreHorizontal className="size-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {enfermedad.estado === "activa" && (
                    <DropdownMenuItem onClick={() => onRecuperar(enfermedad)}>
                      <CheckCircle2 />
                      Marcar como recuperada
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => onEdit(enfermedad)}>
                    <Pencil />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem variant="destructive" onClick={() => onDelete(enfermedad)}>
                    <Trash2 />
                    Eliminar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <EstadoEnfermedadBadge estado={enfermedad.estado} />
              {enfermedad.fecha_recuperacion && (
                <span className="text-xs text-muted-foreground">
                  Recuperado: {formatearFecha(enfermedad.fecha_recuperacion)}
                </span>
              )}
            </div>
            {enfermedad.veterinario && (
              <p className="mt-2 text-sm text-muted-foreground">{enfermedad.veterinario}</p>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
