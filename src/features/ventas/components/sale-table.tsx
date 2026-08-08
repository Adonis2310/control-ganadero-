import Link from "next/link";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SaleStatusBadge } from "@/features/ventas/components/sale-status-badge";
import type { VentaConCliente } from "@/features/ventas/types";
import { formatearNumeroVenta } from "@/features/ventas/utils/venta.utils";
import { formatearFecha } from "@/features/ganado/utils/animal.utils";
import { formatearMoneda } from "@/features/inventario/utils/inventario.utils";

export function SaleTable({ ventas }: { ventas: VentaConCliente[] }) {
  return (
    <>
      <div className="hidden overflow-hidden rounded-xl border bg-card md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Número</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ventas.map((venta) => (
              <TableRow key={venta.id}>
                <TableCell className="font-medium">
                  <Link href={`/ventas/${venta.id}`} className="hover:underline">
                    {formatearNumeroVenta(venta.numero)}
                  </Link>
                </TableCell>
                <TableCell>{formatearFecha(venta.fecha)}</TableCell>
                <TableCell>
                  {venta.cliente ? (
                    <Link href={`/clientes/${venta.cliente.id}`} className="hover:underline">
                      {venta.cliente.nombre}
                    </Link>
                  ) : (
                    "—"
                  )}
                </TableCell>
                <TableCell>
                  <SaleStatusBadge estado={venta.estado} />
                </TableCell>
                <TableCell className="font-medium">{formatearMoneda(venta.total)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-3 md:hidden">
        {ventas.map((venta) => (
          <Link key={venta.id} href={`/ventas/${venta.id}`} className="rounded-xl border bg-card p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-medium">{formatearNumeroVenta(venta.numero)}</p>
                <p className="text-xs text-muted-foreground">{venta.cliente?.nombre ?? "Sin cliente"}</p>
              </div>
              <SaleStatusBadge estado={venta.estado} />
            </div>
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{formatearFecha(venta.fecha)}</span>
              <span className="font-medium">{formatearMoneda(venta.total)}</span>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
