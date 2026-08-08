import type { ReactNode } from "react";
import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatearMoneda } from "@/features/inventario/utils/inventario.utils";
import { SaleStatusBadge } from "@/features/ventas/components/sale-status-badge";
import type { AnimalVentaInfo } from "@/features/ventas/types";
import { formatearNumeroVenta } from "@/features/ventas/utils/venta.utils";
import { formatearFecha } from "@/features/ganado/utils/animal.utils";

function Campo({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <div className="mt-1 text-sm">{value}</div>
    </div>
  );
}

export function AnimalSaleInfo({ venta }: { venta: AnimalVentaInfo }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Información de venta</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Campo label="Fecha de venta" value={formatearFecha(venta.venta.fecha)} />
        <Campo
          label="Cliente"
          value={
            venta.venta.cliente ? (
              <Link href={`/clientes/${venta.venta.cliente.id}`} className="text-primary hover:underline">
                {venta.venta.cliente.nombre}
              </Link>
            ) : (
              "Sin registrar"
            )
          }
        />
        <Campo label="Precio de venta" value={formatearMoneda(venta.precio_unitario)} />
        <Campo
          label="Venta"
          value={
            <Link href={`/ventas/${venta.venta.id}`} className="text-primary hover:underline">
              {formatearNumeroVenta(venta.venta.numero)}
            </Link>
          }
        />
        <Campo label="Estado" value={<SaleStatusBadge estado={venta.venta.estado} />} />
      </CardContent>
    </Card>
  );
}
