import Link from "next/link";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { PesoConAnimal } from "@/features/ganado/types";
import { formatearFecha, formatearPeso } from "@/features/ganado/utils/animal.utils";
import { formatearPorcentaje, formatearVariacion } from "@/features/ganado/utils/peso.utils";

type PesoFila = PesoConAnimal & { variacionKg: number | null; variacionPorcentaje: number | null };

export function PesoGeneralTable({ pesos }: { pesos: PesoFila[] }) {
  return (
    <div className="hidden overflow-hidden rounded-xl border bg-card md:block">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Animal</TableHead>
            <TableHead>Arete</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead>Peso</TableHead>
            <TableHead>Variación</TableHead>
            <TableHead>Observaciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pesos.map((peso) => (
            <TableRow key={peso.id}>
              <TableCell className="font-medium">
                {peso.animal ? (
                  <Link href={`/ganado/${peso.animal.id}`} className="hover:underline">
                    {peso.animal.nombre || peso.animal.identificador}
                  </Link>
                ) : (
                  "—"
                )}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {peso.animal?.identificador ?? "—"}
              </TableCell>
              <TableCell>{formatearFecha(peso.fecha)}</TableCell>
              <TableCell className="font-medium">{formatearPeso(peso.peso)}</TableCell>
              <TableCell>
                {peso.variacionKg === null ? (
                  <span className="text-muted-foreground">—</span>
                ) : (
                  <span
                    className={
                      peso.variacionKg >= 0
                        ? "text-emerald-600 dark:text-emerald-500"
                        : "text-red-600 dark:text-red-500"
                    }
                  >
                    {formatearVariacion(peso.variacionKg)}{" "}
                    <span className="text-xs text-muted-foreground">
                      ({formatearPorcentaje(peso.variacionPorcentaje)})
                    </span>
                  </span>
                )}
              </TableCell>
              <TableCell className="max-w-64 truncate text-muted-foreground">
                {peso.observaciones || "—"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
