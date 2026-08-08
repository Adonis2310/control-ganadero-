import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatearMoneda } from "@/features/inventario/utils/inventario.utils";
import type { SalesStats, VentaConCliente } from "@/features/ventas/types";
import { formatearNumeroVenta } from "@/features/ventas/utils/venta.utils";
import { formatearFecha } from "@/features/ganado/utils/animal.utils";

export function SalesDashboardWidget({
  stats,
  ultimasVentas,
}: {
  stats: SalesStats;
  ultimasVentas: VentaConCliente[];
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
        <div>
          <CardTitle>Ventas</CardTitle>
          <CardDescription>Resumen comercial de la finca</CardDescription>
        </div>
        <Button variant="ghost" size="sm" nativeButton={false} render={<Link href="/ventas" />}>
          Ver ventas
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-lg font-semibold">{stats.ventasDelMes}</p>
            <p className="text-xs text-muted-foreground">Ventas del mes</p>
          </div>
          <div>
            <p className="text-lg font-semibold">{formatearMoneda(stats.ingresosDelMes)}</p>
            <p className="text-xs text-muted-foreground">Ingresos del mes</p>
          </div>
          <div>
            <p className="text-lg font-semibold">{stats.animalesVendidos}</p>
            <p className="text-xs text-muted-foreground">Animales vendidos</p>
          </div>
        </div>

        {ultimasVentas.length === 0 ? (
          <p className="text-sm text-muted-foreground">Todavía no hay ventas registradas.</p>
        ) : (
          <ul className="flex flex-col gap-1.5 border-t pt-3">
            {ultimasVentas.map((venta) => (
              <li key={venta.id} className="flex items-center justify-between gap-2 text-sm">
                <Link href={`/ventas/${venta.id}`} className="text-muted-foreground hover:underline">
                  {formatearNumeroVenta(venta.numero)} · {venta.cliente?.nombre ?? "Sin cliente"}
                </Link>
                <span className="shrink-0 text-xs text-muted-foreground">{formatearFecha(venta.fecha)}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
