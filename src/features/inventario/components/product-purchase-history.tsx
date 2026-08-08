import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PurchaseStatusBadge } from "@/features/compras/components/purchase-status-badge";
import { formatearNumeroCompra } from "@/features/compras/utils/compra.utils";
import type { DetalleCompraConCompra } from "@/features/compras/types";
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

export function ProductPurchaseHistory({ compras }: { compras: DetalleCompraConCompra[] }) {
  if (compras.length === 0) {
    return (
      <div className="flex flex-col gap-3">
        <h4 className="text-sm font-medium text-muted-foreground">Compras</h4>
        <p className="rounded-xl border border-dashed py-10 text-center text-sm text-muted-foreground">
          Este producto todavía no tiene compras registradas.
        </p>
      </div>
    );
  }

  const ultima = compras[0];
  const proveedoresCount = new Map<string, number>();
  for (const linea of compras) {
    if (!linea.compra?.proveedor) continue;
    const key = linea.compra.proveedor.id;
    proveedoresCount.set(key, (proveedoresCount.get(key) ?? 0) + 1);
  }
  let proveedorHabitual: string | null = null;
  let max = 0;
  for (const linea of compras) {
    const proveedor = linea.compra?.proveedor;
    if (!proveedor) continue;
    const count = proveedoresCount.get(proveedor.id) ?? 0;
    if (count > max) {
      max = count;
      proveedorHabitual = proveedor.nombre;
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <h4 className="text-sm font-medium text-muted-foreground">Compras</h4>
      <Card>
        <CardHeader>
          <CardTitle>Resumen de compras</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-3">
          <Campo label="Última compra" value={ultima.compra ? formatearFecha(ultima.compra.fecha) : "Sin registrar"} />
          <Campo label="Proveedor habitual" value={proveedorHabitual ?? "Sin registrar"} />
          <Campo label="Costo de última compra" value={formatearMoneda(ultima.costo_unitario)} />
        </CardContent>
      </Card>

      <div className="hidden overflow-hidden rounded-xl border bg-card md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Compra</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Proveedor</TableHead>
              <TableHead>Cantidad</TableHead>
              <TableHead>Costo unitario</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {compras.map((linea) => (
              <TableRow key={linea.id}>
                <TableCell className="font-medium">
                  {linea.compra && (
                    <Link href={`/compras/${linea.compra.id}`} className="hover:underline">
                      {formatearNumeroCompra(linea.compra.numero)}
                    </Link>
                  )}
                </TableCell>
                <TableCell>{linea.compra ? formatearFecha(linea.compra.fecha) : "—"}</TableCell>
                <TableCell>
                  {linea.compra?.proveedor ? (
                    <Link href={`/proveedores/${linea.compra.proveedor.id}`} className="hover:underline">
                      {linea.compra.proveedor.nombre}
                    </Link>
                  ) : (
                    "—"
                  )}
                </TableCell>
                <TableCell>{linea.cantidad}</TableCell>
                <TableCell>{formatearMoneda(linea.costo_unitario)}</TableCell>
                <TableCell>{linea.compra && <PurchaseStatusBadge estado={linea.compra.estado} />}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-3 md:hidden">
        {compras.map((linea) => (
          <div key={linea.id} className="rounded-xl border bg-card p-4">
            <div className="flex items-start justify-between gap-2">
              <p className="font-medium">{linea.compra && formatearNumeroCompra(linea.compra.numero)}</p>
              {linea.compra && <PurchaseStatusBadge estado={linea.compra.estado} />}
            </div>
            <p className="text-xs text-muted-foreground">
              {linea.compra?.proveedor?.nombre ?? "Sin proveedor"} ·{" "}
              {linea.compra ? formatearFecha(linea.compra.fecha) : ""}
            </p>
            <p className="mt-1 text-sm">
              {linea.cantidad} × {formatearMoneda(linea.costo_unitario)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
