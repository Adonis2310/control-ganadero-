import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SaleStatusBadge } from "@/features/ventas/components/sale-status-badge";
import { formatearNumeroVenta } from "@/features/ventas/utils/venta.utils";
import type { DetalleVentaConVenta } from "@/features/ventas/types";
import { formatearFecha } from "@/features/ganado/utils/animal.utils";
import { formatearCantidad, formatearMoneda } from "@/features/inventario/utils/inventario.utils";

function Campo({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm">{value}</p>
    </div>
  );
}

export function ProductSaleHistory({ ventas }: { ventas: DetalleVentaConVenta[] }) {
  if (ventas.length === 0) {
    return (
      <div className="flex flex-col gap-3">
        <h4 className="text-sm font-medium text-muted-foreground">Ventas</h4>
        <p className="rounded-xl border border-dashed py-10 text-center text-sm text-muted-foreground">
          Este producto todavía no tiene ventas registradas.
        </p>
      </div>
    );
  }

  const ultima = ventas[0];
  const cantidadTotalVendida = ventas
    .filter((v) => v.venta?.estado === "completada")
    .reduce((sum, v) => sum + v.cantidad, 0);

  return (
    <div className="flex flex-col gap-3">
      <h4 className="text-sm font-medium text-muted-foreground">Ventas</h4>
      <Card>
        <CardHeader>
          <CardTitle>Resumen de ventas</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          <Campo label="Cantidad vendida (completadas)" value={formatearCantidad(cantidadTotalVendida)} />
          <Campo label="Última venta" value={ultima.venta ? formatearFecha(ultima.venta.fecha) : "Sin registrar"} />
        </CardContent>
      </Card>

      <div className="hidden overflow-hidden rounded-xl border bg-card md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Venta</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Cantidad</TableHead>
              <TableHead>Precio</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ventas.map((linea) => (
              <TableRow key={linea.id}>
                <TableCell className="font-medium">
                  {linea.venta && (
                    <Link href={`/ventas/${linea.venta.id}`} className="hover:underline">
                      {formatearNumeroVenta(linea.venta.numero)}
                    </Link>
                  )}
                </TableCell>
                <TableCell>{linea.venta ? formatearFecha(linea.venta.fecha) : "—"}</TableCell>
                <TableCell>
                  {linea.venta?.cliente ? (
                    <Link href={`/clientes/${linea.venta.cliente.id}`} className="hover:underline">
                      {linea.venta.cliente.nombre}
                    </Link>
                  ) : (
                    "—"
                  )}
                </TableCell>
                <TableCell>{linea.cantidad}</TableCell>
                <TableCell>{formatearMoneda(linea.precio_unitario)}</TableCell>
                <TableCell>{linea.venta && <SaleStatusBadge estado={linea.venta.estado} />}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-3 md:hidden">
        {ventas.map((linea) => (
          <div key={linea.id} className="rounded-xl border bg-card p-4">
            <div className="flex items-start justify-between gap-2">
              <p className="font-medium">{linea.venta && formatearNumeroVenta(linea.venta.numero)}</p>
              {linea.venta && <SaleStatusBadge estado={linea.venta.estado} />}
            </div>
            <p className="text-xs text-muted-foreground">
              {linea.venta?.cliente?.nombre ?? "Sin cliente"} · {linea.venta ? formatearFecha(linea.venta.fecha) : ""}
            </p>
            <p className="mt-1 text-sm">
              {linea.cantidad} × {formatearMoneda(linea.precio_unitario)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
