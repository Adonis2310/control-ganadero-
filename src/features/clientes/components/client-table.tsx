import Link from "next/link";
import { MoreHorizontal, Pencil, Power, PowerOff } from "lucide-react";

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
import type { ClienteRow } from "@/features/clientes/types";
import { formatearMoneda } from "@/features/inventario/utils/inventario.utils";
import { cn } from "@/lib/utils";

interface ClientTableProps {
  clientes: ClienteRow[];
  totalesPorCliente: Record<string, number>;
  onToggleActivo: (cliente: ClienteRow) => void;
}

function EstadoBadge({ activo }: { activo: boolean }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "border-transparent font-medium",
        activo
          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300"
          : "bg-muted text-muted-foreground",
      )}
    >
      {activo ? "Activo" : "Inactivo"}
    </Badge>
  );
}

export function ClientTable({ clientes, totalesPorCliente, onToggleActivo }: ClientTableProps) {
  return (
    <>
      <div className="hidden overflow-hidden rounded-xl border bg-card md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Identificación</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Correo</TableHead>
              <TableHead>Total de compras</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="w-12 text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clientes.map((cliente) => (
              <TableRow key={cliente.id} className={!cliente.activo ? "opacity-60" : undefined}>
                <TableCell className="font-medium">
                  <Link href={`/clientes/${cliente.id}`} className="hover:underline">
                    {cliente.nombre}
                  </Link>
                </TableCell>
                <TableCell>{cliente.identificacion || "—"}</TableCell>
                <TableCell>{cliente.telefono || "—"}</TableCell>
                <TableCell>{cliente.correo || "—"}</TableCell>
                <TableCell>{formatearMoneda(totalesPorCliente[cliente.id] ?? 0)}</TableCell>
                <TableCell>
                  <EstadoBadge activo={cliente.activo} />
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" aria-label="Acciones del cliente" />}>
                      <MoreHorizontal className="size-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem render={<Link href={`/clientes/${cliente.id}`} />}>Ver detalle</DropdownMenuItem>
                      <DropdownMenuItem render={<Link href={`/clientes/${cliente.id}/editar`} />}>
                        <Pencil />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onToggleActivo(cliente)}>
                        {cliente.activo ? <PowerOff /> : <Power />}
                        {cliente.activo ? "Desactivar" : "Activar"}
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
        {clientes.map((cliente) => (
          <div key={cliente.id} className={"rounded-xl border bg-card p-4" + (!cliente.activo ? " opacity-60" : "")}>
            <div className="flex items-start justify-between gap-2">
              <Link href={`/clientes/${cliente.id}`} className="font-medium hover:underline">
                {cliente.nombre}
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" aria-label="Acciones del cliente" />}>
                  <MoreHorizontal className="size-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem render={<Link href={`/clientes/${cliente.id}`} />}>Ver detalle</DropdownMenuItem>
                  <DropdownMenuItem render={<Link href={`/clientes/${cliente.id}/editar`} />}>
                    <Pencil />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onToggleActivo(cliente)}>
                    {cliente.activo ? <PowerOff /> : <Power />}
                    {cliente.activo ? "Desactivar" : "Activar"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <p className="text-xs text-muted-foreground">{cliente.identificacion || "Sin identificación"}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <EstadoBadge activo={cliente.activo} />
              <span className="text-xs text-muted-foreground">
                {formatearMoneda(totalesPorCliente[cliente.id] ?? 0)}
              </span>
            </div>
            {(cliente.telefono || cliente.correo) && (
              <p className="mt-2 text-sm text-muted-foreground">
                {[cliente.telefono, cliente.correo].filter(Boolean).join(" · ")}
              </p>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
