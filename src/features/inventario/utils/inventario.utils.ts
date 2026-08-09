import { formatCurrency } from "@/features/configuracion/utils/format.utils";
import type {
  EstadoStock,
  InventoryAlert,
  InventoryStats,
  ProductoInventario,
  ProductoInventarioRow,
} from "@/features/inventario/types";

export function calcularEstadoStock(producto: Pick<ProductoInventarioRow, "stock_actual" | "stock_minimo">): EstadoStock {
  if (producto.stock_actual <= 0) return "agotado";
  if (producto.stock_actual <= producto.stock_minimo) return "stock_bajo";
  return "disponible";
}

export const ESTADO_STOCK_LABEL: Record<EstadoStock, string> = {
  disponible: "Disponible",
  stock_bajo: "Stock bajo",
  agotado: "Agotado",
};

export const ESTADO_STOCK_BADGE_CLASS: Record<EstadoStock, string> = {
  disponible: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300",
  stock_bajo: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
  agotado: "bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300",
};

export function calcularValorTotal(producto: Pick<ProductoInventarioRow, "stock_actual" | "costo_unitario">): number {
  return producto.stock_actual * (producto.costo_unitario ?? 0);
}

/**
 * Formateador monetario histórico de la app — se mantiene por compatibilidad
 * con los ~40 componentes que ya lo importan, pero ahora delega en
 * `formatCurrency` (sección 16 de la Fase 12), que respeta la moneda y los
 * decimales configurados en /configuracion en vez de un "$" fijo.
 */
export function formatearMoneda(valor: number): string {
  return formatCurrency(valor);
}

export function formatearCantidad(valor: number): string {
  return valor.toLocaleString("es", { maximumFractionDigits: 2 });
}

export function calcularInventoryStats(productos: ProductoInventario[]): InventoryStats {
  const activos = productos.filter((p) => p.activo);
  return {
    totalProductos: activos.length,
    stockBajo: activos.filter((p) => calcularEstadoStock(p) === "stock_bajo").length,
    agotados: activos.filter((p) => calcularEstadoStock(p) === "agotado").length,
    valorEstimado: activos.reduce((sum, p) => sum + calcularValorTotal(p), 0),
  };
}

/** Alertas de stock bajo/agotado de todos los productos activos, para Inventario y el Dashboard. */
export function construirAlertasInventario(productos: ProductoInventario[]): InventoryAlert[] {
  return productos
    .filter((p) => p.activo)
    .flatMap((p) => {
      const estado = calcularEstadoStock(p);
      if (estado === "disponible") return [];
      return [
        {
          producto: { id: p.id, nombre: p.nombre, unidad_medida: p.unidad_medida, categoria_id: p.categoria_id },
          tipo: estado as "stock_bajo" | "agotado",
        },
      ];
    });
}
