import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PurchaseStatusBadge } from "@/features/compras/components/purchase-status-badge";
import type { CompraRow } from "@/features/compras/types";
import { formatearNumeroCompra } from "@/features/compras/utils/compra.utils";
import type { ProveedorRow, ProveedorStats } from "@/features/proveedores/types";
import { formatearFecha } from "@/features/ganado/utils/animal.utils";
import { formatearMoneda } from "@/features/inventario/utils/inventario.utils";

function Campo({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm">{value}</p>
    </div>
  );
}

export function SupplierDetails({ proveedor, stats }: { proveedor: ProveedorRow; stats: ProveedorStats }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Información del proveedor</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          <Campo label="Nombre" value={proveedor.nombre} />
          <Campo label="Empresa" value={proveedor.empresa || "Sin registrar"} />
          <Campo label="Teléfono" value={proveedor.telefono || "Sin registrar"} />
          <Campo label="Correo" value={proveedor.correo || "Sin registrar"} />
          <Campo label="Tipo" value={proveedor.tipo || "Sin registrar"} />
          <Campo label="Dirección" value={proveedor.direccion || "Sin registrar"} />
          <div className="sm:col-span-2">
            <p className="text-xs font-medium text-muted-foreground">Notas</p>
            <p className="mt-1 text-sm whitespace-pre-wrap">{proveedor.notas || "Sin notas registradas."}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Estadísticas de compras</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          <Campo label="Total comprado" value={formatearMoneda(stats.totalComprado)} />
          <Campo label="Número de compras" value={String(stats.numeroCompras)} />
          <Campo label="Última compra" value={formatearFecha(stats.ultimaCompra)} />
        </CardContent>
      </Card>
    </div>
  );
}

export function SupplierPurchaseHistory({ compras }: { compras: CompraRow[] }) {
  if (compras.length === 0) {
    return (
      <p className="rounded-xl border border-dashed py-12 text-center text-sm text-muted-foreground">
        Este proveedor todavía no tiene compras registradas.
      </p>
    );
  }

  return (
    <>
      <div className="hidden overflow-hidden rounded-xl border bg-card md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Número</TableHead>
              <TableHead>Fecha</TableHead>
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
                  <PurchaseStatusBadge estado={compra.estado} />
                </TableCell>
                <TableCell>{formatearMoneda(compra.total)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-3 md:hidden">
        {compras.map((compra) => (
          <Link key={compra.id} href={`/compras/${compra.id}`} className="rounded-xl border bg-card p-4">
            <div className="flex items-start justify-between gap-2">
              <p className="font-medium">{formatearNumeroCompra(compra.numero)}</p>
              <PurchaseStatusBadge estado={compra.estado} />
            </div>
            <p className="text-xs text-muted-foreground">{formatearFecha(compra.fecha)}</p>
            <p className="mt-1 text-sm">{formatearMoneda(compra.total)}</p>
          </Link>
        ))}
      </div>
    </>
  );
}
