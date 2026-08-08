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
import type { ProveedorRow } from "@/features/proveedores/types";
import { cn } from "@/lib/utils";

interface SupplierTableProps {
  proveedores: ProveedorRow[];
  onToggleActivo: (proveedor: ProveedorRow) => void;
}

export function SupplierTable({ proveedores, onToggleActivo }: SupplierTableProps) {
  return (
    <>
      <div className="hidden overflow-hidden rounded-xl border bg-card md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Empresa</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Correo</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="w-12 text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {proveedores.map((proveedor) => (
              <TableRow key={proveedor.id} className={!proveedor.activo ? "opacity-60" : undefined}>
                <TableCell className="font-medium">
                  <Link href={`/proveedores/${proveedor.id}`} className="hover:underline">
                    {proveedor.nombre}
                  </Link>
                </TableCell>
                <TableCell>{proveedor.empresa || "—"}</TableCell>
                <TableCell>{proveedor.tipo || "—"}</TableCell>
                <TableCell>{proveedor.telefono || "—"}</TableCell>
                <TableCell>{proveedor.correo || "—"}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={cn(
                      "border-transparent font-medium",
                      proveedor.activo
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {proveedor.activo ? "Activo" : "Inactivo"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" aria-label="Acciones del proveedor" />}>
                      <MoreHorizontal className="size-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem render={<Link href={`/proveedores/${proveedor.id}`} />}>Ver detalle</DropdownMenuItem>
                      <DropdownMenuItem render={<Link href={`/proveedores/${proveedor.id}/editar`} />}>
                        <Pencil />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onToggleActivo(proveedor)}>
                        {proveedor.activo ? <PowerOff /> : <Power />}
                        {proveedor.activo ? "Desactivar" : "Activar"}
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
        {proveedores.map((proveedor) => (
          <div key={proveedor.id} className={"rounded-xl border bg-card p-4" + (!proveedor.activo ? " opacity-60" : "")}>
            <div className="flex items-start justify-between gap-2">
              <Link href={`/proveedores/${proveedor.id}`} className="font-medium hover:underline">
                {proveedor.nombre}
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" aria-label="Acciones del proveedor" />}>
                  <MoreHorizontal className="size-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem render={<Link href={`/proveedores/${proveedor.id}`} />}>Ver detalle</DropdownMenuItem>
                  <DropdownMenuItem render={<Link href={`/proveedores/${proveedor.id}/editar`} />}>
                    <Pencil />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onToggleActivo(proveedor)}>
                    {proveedor.activo ? <PowerOff /> : <Power />}
                    {proveedor.activo ? "Desactivar" : "Activar"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <p className="text-xs text-muted-foreground">{proveedor.empresa || "Sin empresa"}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className={cn(
                  "border-transparent font-medium",
                  proveedor.activo
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {proveedor.activo ? "Activo" : "Inactivo"}
              </Badge>
              {proveedor.tipo && <span className="text-xs text-muted-foreground">{proveedor.tipo}</span>}
            </div>
            {(proveedor.telefono || proveedor.correo) && (
              <p className="mt-2 text-sm text-muted-foreground">
                {[proveedor.telefono, proveedor.correo].filter(Boolean).join(" · ")}
              </p>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
