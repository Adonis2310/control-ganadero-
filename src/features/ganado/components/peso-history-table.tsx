import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";

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
import type { PesoConVariacion } from "@/features/ganado/types";
import { formatearFecha } from "@/features/ganado/utils/animal.utils";
import { formatearVariacion, formatearPorcentaje } from "@/features/ganado/utils/peso.utils";

interface PesoHistoryProps {
  pesos: PesoConVariacion[];
  onEdit: (peso: PesoConVariacion) => void;
  onDelete: (peso: PesoConVariacion) => void;
}

function VariacionCell({ peso }: { peso: PesoConVariacion }) {
  if (peso.variacionKg === null) {
    return <span className="text-muted-foreground">—</span>;
  }
  const positivo = peso.variacionKg >= 0;
  return (
    <span className={positivo ? "text-emerald-600 dark:text-emerald-500" : "text-red-600 dark:text-red-500"}>
      {formatearVariacion(peso.variacionKg)}{" "}
      <span className="text-xs text-muted-foreground">
        ({formatearPorcentaje(peso.variacionPorcentaje)})
      </span>
    </span>
  );
}

export function PesoHistoryTable({ pesos, onEdit, onDelete }: PesoHistoryProps) {
  const ordenDesc = [...pesos].reverse();

  return (
    <div className="hidden overflow-hidden rounded-xl border bg-card md:block">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Fecha</TableHead>
            <TableHead>Peso</TableHead>
            <TableHead>Variación</TableHead>
            <TableHead>Observaciones</TableHead>
            <TableHead className="w-12 text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ordenDesc.map((peso) => (
            <TableRow key={peso.id}>
              <TableCell>{formatearFecha(peso.fecha)}</TableCell>
              <TableCell className="font-medium">{peso.peso} kg</TableCell>
              <TableCell>
                <VariacionCell peso={peso} />
              </TableCell>
              <TableCell className="max-w-64 truncate text-muted-foreground">
                {peso.observaciones || "—"}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button variant="ghost" size="icon-sm" aria-label="Acciones del pesaje" />
                    }
                  >
                    <MoreHorizontal className="size-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(peso)}>
                      <Pencil />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem variant="destructive" onClick={() => onDelete(peso)}>
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
  );
}
