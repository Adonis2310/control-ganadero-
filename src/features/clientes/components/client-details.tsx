import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SaleStatusBadge } from "@/features/ventas/components/sale-status-badge";
import type { VentaRow } from "@/features/ventas/types";
import { formatearNumeroVenta } from "@/features/ventas/utils/venta.utils";
import type { ClienteRow, ClienteStats } from "@/features/clientes/types";
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

export function ClientDetails({ cliente, stats }: { cliente: ClienteRow; stats: ClienteStats }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Información del cliente</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          <Campo label="Nombre" value={cliente.nombre} />
          <Campo label="Identificación" value={cliente.identificacion || "Sin registrar"} />
          <Campo label="Teléfono" value={cliente.telefono || "Sin registrar"} />
          <Campo label="Correo" value={cliente.correo || "Sin registrar"} />
          <div className="sm:col-span-2">
            <p className="text-xs font-medium text-muted-foreground">Dirección</p>
            <p className="mt-1 text-sm">{cliente.direccion || "Sin registrar"}</p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-xs font-medium text-muted-foreground">Notas</p>
            <p className="mt-1 text-sm whitespace-pre-wrap">{cliente.notas || "Sin notas registradas."}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Estadísticas comerciales</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          <Campo label="Total comprado" value={formatearMoneda(stats.totalComprado)} />
          <Campo label="Número de operaciones" value={String(stats.numeroOperaciones)} />
          <Campo label="Última compra" value={formatearFecha(stats.ultimaCompra)} />
        </CardContent>
      </Card>
    </div>
  );
}

export function ClientPurchaseHistory({ ventas }: { ventas: VentaRow[] }) {
  if (ventas.length === 0) {
    return (
      <p className="rounded-xl border border-dashed py-12 text-center text-sm text-muted-foreground">
        Este cliente todavía no tiene operaciones registradas.
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
            {ventas.map((venta) => (
              <TableRow key={venta.id}>
                <TableCell className="font-medium">
                  <Link href={`/ventas/${venta.id}`} className="hover:underline">
                    {formatearNumeroVenta(venta.numero)}
                  </Link>
                </TableCell>
                <TableCell>{formatearFecha(venta.fecha)}</TableCell>
                <TableCell>
                  <SaleStatusBadge estado={venta.estado} />
                </TableCell>
                <TableCell>{formatearMoneda(venta.total)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-3 md:hidden">
        {ventas.map((venta) => (
          <Link key={venta.id} href={`/ventas/${venta.id}`} className="rounded-xl border bg-card p-4">
            <div className="flex items-start justify-between gap-2">
              <p className="font-medium">{formatearNumeroVenta(venta.numero)}</p>
              <SaleStatusBadge estado={venta.estado} />
            </div>
            <p className="text-xs text-muted-foreground">{formatearFecha(venta.fecha)}</p>
            <p className="mt-1 text-sm">{formatearMoneda(venta.total)}</p>
          </Link>
        ))}
      </div>
    </>
  );
}
