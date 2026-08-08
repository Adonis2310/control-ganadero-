import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StockBadge } from "@/features/inventario/components/stock-badge";
import type { ProductoInventario } from "@/features/inventario/types";
import {
  calcularEstadoStock,
  calcularValorTotal,
  formatearCantidad,
  formatearMoneda,
} from "@/features/inventario/utils/inventario.utils";

function Campo({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm">{value}</p>
    </div>
  );
}

export function ProductDetails({ producto }: { producto: ProductoInventario }) {
  const estado = calcularEstadoStock(producto);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Información</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          <Campo label="Nombre" value={producto.nombre} />
          <Campo label="Categoría" value={producto.categoria?.nombre ?? "Sin categoría"} />
          <Campo label="Unidad" value={producto.unidad_medida} />
          <Campo
            label="Costo unitario"
            value={producto.costo_unitario !== null ? formatearMoneda(producto.costo_unitario) : "Sin registrar"}
          />
          <Campo label="Proveedor" value="Sin registrar" />
          <div className="sm:col-span-2">
            <p className="text-xs font-medium text-muted-foreground">Descripción</p>
            <p className="mt-1 text-sm whitespace-pre-wrap">
              {producto.descripcion || "Sin descripción registrada."}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
          <CardTitle>Stock</CardTitle>
          <StockBadge estado={estado} />
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          <Campo label="Stock actual" value={`${formatearCantidad(producto.stock_actual)} ${producto.unidad_medida}`} />
          <Campo label="Stock mínimo" value={`${formatearCantidad(producto.stock_minimo)} ${producto.unidad_medida}`} />
          <Campo label="Valor estimado" value={formatearMoneda(calcularValorTotal(producto))} />
          <Campo label="Estado" value={estado === "disponible" ? "Disponible" : estado === "stock_bajo" ? "Stock bajo" : "Agotado"} />
        </CardContent>
      </Card>
    </div>
  );
}
