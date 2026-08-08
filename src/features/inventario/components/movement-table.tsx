import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { MovimientoConProducto } from "@/features/inventario/types";
import { formatearCantidad, formatearMoneda } from "@/features/inventario/utils/inventario.utils";
import { formatearFecha } from "@/features/ganado/utils/animal.utils";
import { cn } from "@/lib/utils";

const TIPO_LABEL: Record<string, string> = {
  entrada: "Entrada",
  salida: "Salida",
  ajuste: "Ajuste",
};

const TIPO_BADGE_CLASS: Record<string, string> = {
  entrada: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300",
  salida: "bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300",
  ajuste: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
};

function signoCantidad(tipo: string, cantidad: number): string {
  if (tipo === "salida") return `-${formatearCantidad(cantidad)}`;
  if (tipo === "ajuste") return `${cantidad > 0 ? "+" : ""}${formatearCantidad(cantidad)}`;
  return `+${formatearCantidad(cantidad)}`;
}

interface MovementTableProps {
  movimientos: MovimientoConProducto[];
  mostrarProducto?: boolean;
  unidadMedida?: string;
}

export function MovementTable({ movimientos, mostrarProducto = false, unidadMedida }: MovementTableProps) {
  return (
    <>
      <div className="hidden overflow-hidden rounded-xl border bg-card md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              {mostrarProducto && <TableHead>Producto</TableHead>}
              <TableHead>Tipo</TableHead>
              <TableHead>Cantidad</TableHead>
              <TableHead>Motivo</TableHead>
              <TableHead>Costo</TableHead>
              <TableHead>Observaciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {movimientos.map((movimiento) => (
              <TableRow key={movimiento.id}>
                <TableCell>{formatearFecha(movimiento.fecha)}</TableCell>
                {mostrarProducto && (
                  <TableCell>
                    {movimiento.producto ? (
                      <Link href={`/inventario/${movimiento.producto.id}`} className="hover:underline">
                        {movimiento.producto.nombre}
                      </Link>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                )}
                <TableCell>
                  <Badge variant="outline" className={cn("border-transparent font-medium", TIPO_BADGE_CLASS[movimiento.tipo])}>
                    {TIPO_LABEL[movimiento.tipo]}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium">
                  {signoCantidad(movimiento.tipo, movimiento.cantidad)}{" "}
                  {unidadMedida ?? movimiento.producto?.unidad_medida ?? ""}
                </TableCell>
                <TableCell>{movimiento.motivo}</TableCell>
                <TableCell>{movimiento.costo_unitario !== null ? formatearMoneda(movimiento.costo_unitario) : "—"}</TableCell>
                <TableCell className="max-w-64 truncate text-muted-foreground">
                  {movimiento.observaciones || "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-3 md:hidden">
        {movimientos.map((movimiento) => (
          <div key={movimiento.id} className="rounded-xl border bg-card p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                {mostrarProducto && movimiento.producto && (
                  <Link href={`/inventario/${movimiento.producto.id}`} className="font-medium hover:underline">
                    {movimiento.producto.nombre}
                  </Link>
                )}
                <p className="text-xs text-muted-foreground">{formatearFecha(movimiento.fecha)}</p>
              </div>
              <Badge variant="outline" className={cn("border-transparent font-medium", TIPO_BADGE_CLASS[movimiento.tipo])}>
                {TIPO_LABEL[movimiento.tipo]}
              </Badge>
            </div>
            <p className="mt-2 text-sm font-medium">
              {signoCantidad(movimiento.tipo, movimiento.cantidad)} {unidadMedida ?? movimiento.producto?.unidad_medida ?? ""}
            </p>
            <p className="text-sm text-muted-foreground">{movimiento.motivo}</p>
            {movimiento.costo_unitario !== null && (
              <p className="text-xs text-muted-foreground">Costo: {formatearMoneda(movimiento.costo_unitario)}</p>
            )}
            {movimiento.observaciones && (
              <p className="mt-1 text-sm text-muted-foreground">{movimiento.observaciones}</p>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
