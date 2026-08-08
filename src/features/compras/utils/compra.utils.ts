import type { CompraRow, EstadoCompra, LineaCompraInput, PurchaseStats } from "@/features/compras/types";

export const ESTADO_COMPRA_LABEL: Record<EstadoCompra, string> = {
  borrador: "Borrador",
  pendiente: "Pendiente",
  recibida: "Recibida",
  cancelada: "Cancelada",
};

export const ESTADO_COMPRA_BADGE_CLASS: Record<EstadoCompra, string> = {
  borrador: "bg-muted text-muted-foreground",
  pendiente: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
  recibida: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300",
  cancelada: "bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300",
};

/** Número de compra legible ("Compra #0001"). El correlativo real vive en `compras.numero`. */
export function formatearNumeroCompra(numero: number): string {
  return `#${String(numero).padStart(4, "0")}`;
}

/** Subtotal de una línea, solo para mostrarlo en vivo en el formulario; el valor real lo recalcula el servidor. */
export function calcularSubtotalLinea(linea: Pick<LineaCompraInput, "cantidad" | "costo_unitario" | "descuento">): number {
  return Number((linea.cantidad * linea.costo_unitario - linea.descuento).toFixed(2));
}

export interface TotalesPreview {
  subtotal: number;
  total: number;
}

/** Totales en vivo del formulario, antes de guardar (el servidor los vuelve a calcular al insertar). */
export function calcularTotalesPreview(
  lineas: Pick<LineaCompraInput, "cantidad" | "costo_unitario" | "descuento">[],
  descuentoGeneral: number,
  impuestos: number,
): TotalesPreview {
  const subtotal = lineas.reduce((sum, linea) => sum + calcularSubtotalLinea(linea), 0);
  const total = Number((subtotal - descuentoGeneral + impuestos).toFixed(2));
  return { subtotal: Number(subtotal.toFixed(2)), total };
}

export function calcularPurchaseStats(compras: CompraRow[]): PurchaseStats {
  const hoy = new Date();
  const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString().split("T")[0];

  return {
    totalCompras: compras.length,
    totalGastado: compras
      .filter((c) => c.estado === "recibida")
      .reduce((sum, c) => sum + c.total, 0),
    pendientes: compras.filter((c) => c.estado === "pendiente").length,
    recibidas: compras.filter((c) => c.estado === "recibida").length,
    comprasDelMes: compras.filter((c) => c.fecha >= inicioMes).length,
  };
}
