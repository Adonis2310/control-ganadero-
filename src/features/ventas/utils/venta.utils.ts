import type { DetalleVentaRow, EstadoVenta, LineaVentaInput, SalesStats, VentaRow } from "@/features/ventas/types";

export const ESTADO_VENTA_LABEL: Record<EstadoVenta, string> = {
  borrador: "Borrador",
  pendiente: "Pendiente",
  completada: "Completada",
  cancelada: "Cancelada",
};

export const ESTADO_VENTA_BADGE_CLASS: Record<EstadoVenta, string> = {
  borrador: "bg-muted text-muted-foreground",
  pendiente: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
  completada: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300",
  cancelada: "bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300",
};

/** Número de venta legible ("Venta #0001"). El correlativo real vive en `ventas.numero`. */
export function formatearNumeroVenta(numero: number): string {
  return `#${String(numero).padStart(4, "0")}`;
}

/** Subtotal de una línea, solo para mostrarlo en vivo en el formulario; el valor real lo recalcula el servidor. */
export function calcularSubtotalLinea(linea: Pick<LineaVentaInput, "cantidad" | "precio_unitario" | "descuento">): number {
  return Number((linea.cantidad * linea.precio_unitario - linea.descuento).toFixed(2));
}

export interface TotalesPreview {
  subtotal: number;
  total: number;
}

/** Totales en vivo del formulario, antes de guardar (el servidor los vuelve a calcular al insertar). */
export function calcularTotalesPreview(
  lineas: Pick<LineaVentaInput, "cantidad" | "precio_unitario" | "descuento">[],
  descuentoGeneral: number,
  impuestos: number,
): TotalesPreview {
  const subtotal = lineas.reduce((sum, linea) => sum + calcularSubtotalLinea(linea), 0);
  const total = Number((subtotal - descuentoGeneral + impuestos).toFixed(2));
  return { subtotal: Number(subtotal.toFixed(2)), total };
}

export function calcularSalesStats(
  ventas: VentaRow[],
  lineas: Pick<DetalleVentaRow, "venta_id" | "tipo">[],
): SalesStats {
  const hoy = new Date();
  const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString().split("T")[0];
  const completadas = ventas.filter((v) => v.estado === "completada");
  const completadasDelMes = completadas.filter((v) => v.fecha >= inicioMes);
  const idsCompletadas = new Set(completadas.map((v) => v.id));

  return {
    totalVendido: completadas.reduce((sum, v) => sum + v.total, 0),
    ventasDelMes: ventas.filter((v) => v.fecha >= inicioMes).length,
    ingresosDelMes: completadasDelMes.reduce((sum, v) => sum + v.total, 0),
    completadas: completadas.length,
    pendientes: ventas.filter((v) => v.estado === "pendiente").length,
    canceladas: ventas.filter((v) => v.estado === "cancelada").length,
    animalesVendidos: lineas.filter((l) => l.tipo === "animal" && idsCompletadas.has(l.venta_id)).length,
    productosVendidos: lineas.filter((l) => l.tipo === "producto" && idsCompletadas.has(l.venta_id)).length,
  };
}
