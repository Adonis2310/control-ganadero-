import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PurchaseTotals } from "@/features/compras/components/purchase-totals";
import type { CompraCompleta } from "@/features/compras/types";
import { formatearMoneda } from "@/features/inventario/utils/inventario.utils";

export function PurchaseDetails({ compra }: { compra: CompraCompleta }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Productos</CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            <div className="hidden overflow-hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead>Cantidad</TableHead>
                    <TableHead>Costo unitario</TableHead>
                    <TableHead>Descuento</TableHead>
                    <TableHead>Subtotal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {compra.lineas.map((linea) => (
                    <TableRow key={linea.id}>
                      <TableCell className="font-medium">
                        {linea.producto ? (
                          <Link href={`/inventario/${linea.producto.id}`} className="hover:underline">
                            {linea.producto.nombre}
                          </Link>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell>
                        {linea.cantidad} {linea.producto?.unidad_medida ?? ""}
                      </TableCell>
                      <TableCell>{formatearMoneda(linea.costo_unitario)}</TableCell>
                      <TableCell>{formatearMoneda(linea.descuento)}</TableCell>
                      <TableCell className="font-medium">{formatearMoneda(linea.subtotal)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex flex-col gap-3 px-4 md:hidden">
              {compra.lineas.map((linea) => (
                <div key={linea.id} className="rounded-xl border p-3">
                  <p className="font-medium">{linea.producto?.nombre ?? "—"}</p>
                  <p className="text-sm text-muted-foreground">
                    {linea.cantidad} {linea.producto?.unidad_medida ?? ""} × {formatearMoneda(linea.costo_unitario)}
                    {linea.descuento > 0 ? ` − ${formatearMoneda(linea.descuento)}` : ""}
                  </p>
                  <p className="mt-1 text-sm font-medium">{formatearMoneda(linea.subtotal)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <PurchaseTotals
          subtotal={compra.subtotal}
          descuento={compra.descuento}
          impuestos={compra.impuestos}
          total={compra.total}
        />
      </div>

      {compra.observaciones && (
        <Card>
          <CardHeader>
            <CardTitle>Observaciones</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{compra.observaciones}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
