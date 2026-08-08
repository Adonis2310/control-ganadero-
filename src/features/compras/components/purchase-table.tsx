import Link from "next/link";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PurchaseStatusBadge } from "@/features/compras/components/purchase-status-badge";
import type { CompraConProveedor } from "@/features/compras/types";
import { formatearNumeroCompra } from "@/features/compras/utils/compra.utils";
import { formatearFecha } from "@/features/ganado/utils/animal.utils";
import { formatearMoneda } from "@/features/inventario/utils/inventario.utils";

export function PurchaseTable({ compras }: { compras: CompraConProveedor[] }) {
  return (
    <>
      <div className="hidden overflow-hidden rounded-xl border bg-card md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Número</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Proveedor</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {compras.map((compra) => (
              <TableRow key={compra.id}>
                <TableCell className="font-medium">
                  <Link href={`/compras/${compra.id}`} className="hover:underline">
                    {formatearNumeroCompra(compra.numero)}
                  </Link>
                </TableCell>
                <TableCell>{formatearFecha(compra.fecha)}</TableCell>
                <TableCell>
                  {compra.proveedor ? (
                    <Link href={`/proveedores/${compra.proveedor.id}`} className="hover:underline">
                      {compra.proveedor.nombre}
                    </Link>
                  ) : (
                    "—"
                  )}
                </TableCell>
                <TableCell>
                  <PurchaseStatusBadge estado={compra.estado} />
                </TableCell>
                <TableCell className="font-medium">{formatearMoneda(compra.total)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-3 md:hidden">
        {compras.map((compra) => (
          <Link key={compra.id} href={`/compras/${compra.id}`} className="rounded-xl border bg-card p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-medium">{formatearNumeroCompra(compra.numero)}</p>
                <p className="text-xs text-muted-foreground">{compra.proveedor?.nombre ?? "Sin proveedor"}</p>
              </div>
              <PurchaseStatusBadge estado={compra.estado} />
            </div>
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{formatearFecha(compra.fecha)}</span>
              <span className="font-medium">{formatearMoneda(compra.total)}</span>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
