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
import type { TratamientoConEnfermedad } from "@/features/ganado/types";
import { formatearFecha } from "@/features/ganado/utils/animal.utils";
import {
  ESTADO_TRATAMIENTO_BADGE_CLASS,
  ESTADO_TRATAMIENTO_LABEL,
  calcularEstadoTratamiento,
} from "@/features/ganado/utils/salud.utils";
import { cn } from "@/lib/utils";

interface TreatmentTableProps {
  tratamientos: TratamientoConEnfermedad[];
  onEdit: (tratamiento: TratamientoConEnfermedad) => void;
  onDelete: (tratamiento: TratamientoConEnfermedad) => void;
}

function EstadoTratamientoBadge({ fechaFin }: { fechaFin: string | null }) {
  const estado = calcularEstadoTratamiento(fechaFin);
  return (
    <Badge
      variant="outline"
      className={cn("border-transparent font-medium", ESTADO_TRATAMIENTO_BADGE_CLASS[estado])}
    >
      {ESTADO_TRATAMIENTO_LABEL[estado]}
    </Badge>
  );
}

export function TreatmentTable({ tratamientos, onEdit, onDelete }: TreatmentTableProps) {
  return (
    <>
      <div className="hidden overflow-hidden rounded-xl border bg-card md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tratamiento</TableHead>
              <TableHead>Medicamento</TableHead>
              <TableHead>Enfermedad relacionada</TableHead>
              <TableHead>Inicio</TableHead>
              <TableHead>Fin</TableHead>
              <TableHead>Dosis</TableHead>
              <TableHead>Frecuencia</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="w-12 text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tratamientos.map((tratamiento) => (
              <TableRow key={tratamiento.id}>
                <TableCell className="font-medium">{tratamiento.tratamiento}</TableCell>
                <TableCell>{tratamiento.medicamento || "—"}</TableCell>
                <TableCell>{tratamiento.enfermedad?.enfermedad || "—"}</TableCell>
                <TableCell>{formatearFecha(tratamiento.fecha_inicio)}</TableCell>
                <TableCell>{formatearFecha(tratamiento.fecha_fin)}</TableCell>
                <TableCell>{tratamiento.dosis || "—"}</TableCell>
                <TableCell>{tratamiento.frecuencia || "—"}</TableCell>
                <TableCell>
                  <EstadoTratamientoBadge fechaFin={tratamiento.fecha_fin} />
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={<Button variant="ghost" size="icon-sm" aria-label="Acciones del tratamiento" />}
                    >
                      <MoreHorizontal className="size-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(tratamiento)}>
                        <Pencil />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem variant="destructive" onClick={() => onDelete(tratamiento)}>
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
        {tratamientos.map((tratamiento) => (
          <div key={tratamiento.id} className="rounded-xl border bg-card p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-medium">{tratamiento.tratamiento}</p>
                <p className="text-xs text-muted-foreground">
                  {formatearFecha(tratamiento.fecha_inicio)}
                  {tratamiento.fecha_fin ? ` – ${formatearFecha(tratamiento.fecha_fin)}` : ""}
                </p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={<Button variant="ghost" size="icon-sm" aria-label="Acciones del tratamiento" />}
                >
                  <MoreHorizontal className="size-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(tratamiento)}>
                    <Pencil />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem variant="destructive" onClick={() => onDelete(tratamiento)}>
                    <Trash2 />
                    Eliminar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <EstadoTratamientoBadge fechaFin={tratamiento.fecha_fin} />
              {tratamiento.enfermedad && (
                <span className="text-xs text-muted-foreground">
                  Enfermedad: {tratamiento.enfermedad.enfermedad}
                </span>
              )}
            </div>
            {(tratamiento.medicamento || tratamiento.dosis || tratamiento.frecuencia) && (
              <p className="mt-2 text-sm text-muted-foreground">
                {[tratamiento.medicamento, tratamiento.dosis, tratamiento.frecuencia]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
