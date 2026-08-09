import { MoreVertical, Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { PesoConVariacion } from "@/features/ganado/types";
import { formatearFecha, formatearPeso } from "@/features/ganado/utils/animal.utils";
import { formatearVariacion, formatearPorcentaje } from "@/features/ganado/utils/peso.utils";

interface PesoHistoryMobileProps {
  pesos: PesoConVariacion[];
  onEdit: (peso: PesoConVariacion) => void;
  onDelete: (peso: PesoConVariacion) => void;
}

export function PesoHistoryMobile({ pesos, onEdit, onDelete }: PesoHistoryMobileProps) {
  const ordenDesc = [...pesos].reverse();

  return (
    <div className="flex flex-col gap-3 md:hidden">
      {ordenDesc.map((peso) => {
        const positivo = (peso.variacionKg ?? 0) >= 0;
        return (
          <div key={peso.id} className="rounded-xl border bg-card p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-lg font-semibold">{formatearPeso(peso.peso)}</p>
                <p className="text-xs text-muted-foreground">{formatearFecha(peso.fecha)}</p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button variant="ghost" size="icon-sm" aria-label="Acciones del pesaje" />
                  }
                >
                  <MoreVertical className="size-4" />
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
            </div>
            {peso.variacionKg !== null && (
              <p
                className={
                  "mt-2 text-sm " +
                  (positivo ? "text-emerald-600 dark:text-emerald-500" : "text-red-600 dark:text-red-500")
                }
              >
                {formatearVariacion(peso.variacionKg)} ({formatearPorcentaje(peso.variacionPorcentaje)})
              </p>
            )}
            {peso.observaciones && (
              <p className="mt-2 text-sm text-muted-foreground">{peso.observaciones}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
