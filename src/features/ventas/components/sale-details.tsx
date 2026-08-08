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
import { SaleTotals } from "@/features/ventas/components/sale-totals";
import type { VentaCompleta } from "@/features/ventas/types";
import { TIPO_DETALLE_VENTA_OPTIONS } from "@/features/ventas/types";
import { formatearMoneda } from "@/features/inventario/utils/inventario.utils";

const TIPO_LABEL = Object.fromEntries(TIPO_DETALLE_VENTA_OPTIONS.map((o) => [o.value, o.label]));

function descripcionLinea(linea: VentaCompleta["lineas"][number]): { texto: string; href: string | null } {
  if (linea.tipo === "animal" && linea.animal) {
    return {
      texto: `${linea.animal.identificador}${linea.animal.nombre ? ` — ${linea.animal.nombre}` : ""}`,
      href: `/ganado/${linea.animal.id}`,
    };
  }
  if (linea.tipo === "producto" && linea.producto) {
    return { texto: linea.producto.nombre, href: `/inventario/${linea.producto.id}` };
  }
  return { texto: linea.descripcion || "—", href: null };
}

export function SaleDetails({ venta }: { venta: VentaCompleta }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Elementos de la venta</CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            <div className="hidden overflow-hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Cantidad</TableHead>
                    <TableHead>Precio</TableHead>
                    <TableHead>Descuento</TableHead>
                    <TableHead>Subtotal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {venta.lineas.map((linea) => {
                    const { texto, href } = descripcionLinea(linea);
                    return (
                      <TableRow key={linea.id}>
                        <TableCell className="font-medium">
                          {href ? (
                            <Link href={href} className="hover:underline">
                              {texto}
                            </Link>
                          ) : (
                            texto
                          )}
                        </TableCell>
                        <TableCell>{TIPO_LABEL[linea.tipo]}</TableCell>
                        <TableCell>{linea.cantidad}</TableCell>
                        <TableCell>{formatearMoneda(linea.precio_unitario)}</TableCell>
                        <TableCell>{formatearMoneda(linea.descuento)}</TableCell>
                        <TableCell className="font-medium">{formatearMoneda(linea.subtotal)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            <div className="flex flex-col gap-3 px-4 md:hidden">
              {venta.lineas.map((linea) => {
                const { texto } = descripcionLinea(linea);
                return (
                  <div key={linea.id} className="rounded-xl border p-3">
                    <p className="font-medium">{texto}</p>
                    <p className="text-sm text-muted-foreground">
                      {TIPO_LABEL[linea.tipo]} · {linea.cantidad} × {formatearMoneda(linea.precio_unitario)}
                      {linea.descuento > 0 ? ` − ${formatearMoneda(linea.descuento)}` : ""}
                    </p>
                    <p className="mt-1 text-sm font-medium">{formatearMoneda(linea.subtotal)}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <SaleTotals
          subtotal={venta.subtotal}
          descuento={venta.descuento}
          impuestos={venta.impuestos}
          total={venta.total}
        />
      </div>

      {venta.observaciones && (
        <Card>
          <CardHeader>
            <CardTitle>Observaciones</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{venta.observaciones}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
