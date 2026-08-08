import Link from "next/link";
import { Eye, MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatearMoneda } from "@/features/inventario/utils/inventario.utils";
import type { GastoConReferencias } from "@/features/finanzas/types";
import { formatearFecha } from "@/features/ganado/utils/animal.utils";

interface ExpenseTableProps {
  gastos: GastoConReferencias[];
  onView: (gasto: GastoConReferencias) => void;
  onEdit: (gasto: GastoConReferencias) => void;
  onDelete: (gasto: GastoConReferencias) => void;
}

export function ExpenseTable({ gastos, onView, onEdit, onDelete }: ExpenseTableProps) {
  return (
    <>
      <div className="hidden overflow-hidden rounded-xl border bg-card md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Monto</TableHead>
              <TableHead>Método de pago</TableHead>
              <TableHead>Proveedor</TableHead>
              <TableHead>Animal</TableHead>
              <TableHead className="w-12 text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {gastos.map((gasto) => (
              <TableRow key={gasto.id}>
                <TableCell>{formatearFecha(gasto.fecha)}</TableCell>
                <TableCell>{gasto.categoria?.nombre ?? "—"}</TableCell>
                <TableCell className="max-w-56 truncate font-medium">{gasto.descripcion}</TableCell>
                <TableCell>{formatearMoneda(gasto.monto)}</TableCell>
                <TableCell>{gasto.metodo_pago || "—"}</TableCell>
                <TableCell>
                  {gasto.proveedor ? (
                    <Link href={`/proveedores/${gasto.proveedor.id}`} className="hover:underline">
                      {gasto.proveedor.nombre}
                    </Link>
                  ) : (
                    "—"
                  )}
                </TableCell>
                <TableCell>
                  {gasto.animal ? (
                    <Link href={`/ganado/${gasto.animal.id}`} className="hover:underline">
                      {gasto.animal.identificador}
                    </Link>
                  ) : (
                    "—"
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" aria-label="Acciones del gasto" />}>
                      <MoreHorizontal className="size-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onView(gasto)}>
                        <Eye />
                        Ver
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEdit(gasto)}>
                        <Pencil />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem variant="destructive" onClick={() => onDelete(gasto)}>
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
        {gastos.map((gasto) => (
          <div key={gasto.id} className="rounded-xl border bg-card p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-medium">{gasto.descripcion}</p>
                <p className="text-xs text-muted-foreground">
                  {gasto.categoria?.nombre ?? "Sin categoría"} · {formatearFecha(gasto.fecha)}
                </p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" aria-label="Acciones del gasto" />}>
                  <MoreHorizontal className="size-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onView(gasto)}>
                    <Eye />
                    Ver
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEdit(gasto)}>
                    <Pencil />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem variant="destructive" onClick={() => onDelete(gasto)}>
                    <Trash2 />
                    Eliminar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <p className="mt-2 text-sm font-medium">{formatearMoneda(gasto.monto)}</p>
            {(gasto.proveedor || gasto.animal || gasto.metodo_pago) && (
              <p className="mt-1 text-xs text-muted-foreground">
                {[gasto.metodo_pago, gasto.proveedor?.nombre, gasto.animal?.identificador].filter(Boolean).join(" · ")}
              </p>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
