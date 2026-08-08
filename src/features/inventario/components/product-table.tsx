import Link from "next/link";
import { MoreHorizontal, Pencil, PowerOff, Power } from "lucide-react";

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
import { StockBadge } from "@/features/inventario/components/stock-badge";
import type { ProductoInventario } from "@/features/inventario/types";
import { calcularEstadoStock, calcularValorTotal, formatearCantidad, formatearMoneda } from "@/features/inventario/utils/inventario.utils";

interface ProductTableProps {
  productos: ProductoInventario[];
  onToggleActivo: (producto: ProductoInventario) => void;
}

export function ProductTable({ productos, onToggleActivo }: ProductTableProps) {
  return (
    <>
      <div className="hidden overflow-hidden rounded-xl border bg-card md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Producto</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Stock actual</TableHead>
              <TableHead>Unidad</TableHead>
              <TableHead>Stock mínimo</TableHead>
              <TableHead>Costo unitario</TableHead>
              <TableHead>Valor total</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="w-12 text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {productos.map((producto) => (
              <TableRow key={producto.id} className={!producto.activo ? "opacity-60" : undefined}>
                <TableCell className="font-medium">
                  <Link href={`/inventario/${producto.id}`} className="hover:underline">
                    {producto.nombre}
                  </Link>
                  {!producto.activo && <span className="ml-2 text-xs text-muted-foreground">(inactivo)</span>}
                </TableCell>
                <TableCell>{producto.categoria?.nombre ?? "—"}</TableCell>
                <TableCell>{formatearCantidad(producto.stock_actual)}</TableCell>
                <TableCell>{producto.unidad_medida}</TableCell>
                <TableCell>{formatearCantidad(producto.stock_minimo)}</TableCell>
                <TableCell>{producto.costo_unitario !== null ? formatearMoneda(producto.costo_unitario) : "—"}</TableCell>
                <TableCell>{formatearMoneda(calcularValorTotal(producto))}</TableCell>
                <TableCell>
                  <StockBadge estado={calcularEstadoStock(producto)} />
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" aria-label="Acciones del producto" />}>
                      <MoreHorizontal className="size-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem render={<Link href={`/inventario/${producto.id}`} />}>Ver detalle</DropdownMenuItem>
                      <DropdownMenuItem render={<Link href={`/inventario/${producto.id}/editar`} />}>
                        <Pencil />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onToggleActivo(producto)}>
                        {producto.activo ? <PowerOff /> : <Power />}
                        {producto.activo ? "Desactivar" : "Activar"}
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
        {productos.map((producto) => (
          <div key={producto.id} className={"rounded-xl border bg-card p-4" + (!producto.activo ? " opacity-60" : "")}>
            <div className="flex items-start justify-between gap-2">
              <Link href={`/inventario/${producto.id}`} className="font-medium hover:underline">
                {producto.nombre}
                {!producto.activo && <span className="ml-2 text-xs text-muted-foreground">(inactivo)</span>}
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" aria-label="Acciones del producto" />}>
                  <MoreHorizontal className="size-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem render={<Link href={`/inventario/${producto.id}`} />}>Ver detalle</DropdownMenuItem>
                  <DropdownMenuItem render={<Link href={`/inventario/${producto.id}/editar`} />}>
                    <Pencil />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onToggleActivo(producto)}>
                    {producto.activo ? <PowerOff /> : <Power />}
                    {producto.activo ? "Desactivar" : "Activar"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <p className="text-xs text-muted-foreground">{producto.categoria?.nombre ?? "Sin categoría"}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <StockBadge estado={calcularEstadoStock(producto)} />
              <span className="text-xs text-muted-foreground">
                {formatearCantidad(producto.stock_actual)} {producto.unidad_medida} · mín. {formatearCantidad(producto.stock_minimo)}
              </span>
            </div>
            <p className="mt-2 text-sm">Valor: {formatearMoneda(calcularValorTotal(producto))}</p>
          </div>
        ))}
      </div>
    </>
  );
}
