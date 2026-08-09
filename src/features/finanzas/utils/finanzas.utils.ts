import { formatCurrencyCompact } from "@/features/configuracion/utils/format.utils";
import type { CategoriaGastoRow, ExpenseCategoryPoint, FinancialSummaryData, GastoConReferencias, GastoRow, IncomeExpenseMonthPoint, IncomeTypePoint, OperacionReciente, RangoFechas, TipoIngreso } from "@/features/finanzas/types";
import { enumerarMeses, mesDeFecha } from "@/features/finanzas/utils/periodo.utils";
import type { CompraConProveedor, CompraRow } from "@/features/compras/types";
import { formatearNumeroCompra } from "@/features/compras/utils/compra.utils";
import type { DetalleVentaRow, VentaConCliente, VentaRow } from "@/features/ventas/types";
import { formatearNumeroVenta } from "@/features/ventas/utils/venta.utils";

function dentroDeRango(fecha: string, rango: RangoFechas): boolean {
  return fecha >= rango.desde && fecha <= rango.hasta;
}

/** Versión abreviada de un monto (ej. "₡45k", "$1.2M"), para ejes de gráficos donde el monto completo no cabe. Delega en `formatCurrencyCompact` (sección 16). */
export function formatearMonedaCompacta(valor: number): string {
  return formatCurrencyCompact(valor);
}

export function filtrarVentasCompletadas(ventas: VentaRow[], rango: RangoFechas): VentaRow[] {
  return ventas.filter((v) => v.estado === "completada" && dentroDeRango(v.fecha, rango));
}

export function filtrarComprasRecibidas(compras: CompraRow[], rango: RangoFechas): CompraRow[] {
  return compras.filter((c) => c.estado === "recibida" && dentroDeRango(c.fecha, rango));
}

export function filtrarGastosPorRango(gastos: GastoRow[], rango: RangoFechas): GastoRow[] {
  return gastos.filter((g) => dentroDeRango(g.fecha, rango));
}

/**
 * Resumen financiero del período: ingresos (ventas completadas), compras
 * (recibidas) y gastos son fuentes independientes que nunca se duplican
 * entre sí (sección 27 de la Fase 9).
 */
export function calcularResumenFinanciero(
  ventas: VentaRow[],
  compras: CompraRow[],
  gastos: GastoRow[],
  rango: RangoFechas,
): FinancialSummaryData {
  const ingresos = filtrarVentasCompletadas(ventas, rango).reduce((sum, v) => sum + v.total, 0);
  const comprasTotal = filtrarComprasRecibidas(compras, rango).reduce((sum, c) => sum + c.total, 0);
  const gastosTotal = filtrarGastosPorRango(gastos, rango).reduce((sum, g) => sum + g.monto, 0);
  const egresosTotales = comprasTotal + gastosTotal;

  return {
    ingresos,
    compras: comprasTotal,
    gastos: gastosTotal,
    egresosTotales,
    resultadoOperativo: ingresos - egresosTotales,
  };
}

export function calcularSerieMensual(
  ventas: VentaRow[],
  compras: CompraRow[],
  gastos: GastoRow[],
  rango: RangoFechas,
): IncomeExpenseMonthPoint[] {
  const ventasCompletadas = filtrarVentasCompletadas(ventas, rango);
  const comprasRecibidas = filtrarComprasRecibidas(compras, rango);
  const gastosEnRango = filtrarGastosPorRango(gastos, rango);

  return enumerarMeses(rango).map(({ mes, mesLabel }) => ({
    mes,
    mesLabel,
    ingresos: ventasCompletadas.filter((v) => mesDeFecha(v.fecha) === mes).reduce((sum, v) => sum + v.total, 0),
    compras: comprasRecibidas.filter((c) => mesDeFecha(c.fecha) === mes).reduce((sum, c) => sum + c.total, 0),
    gastos: gastosEnRango.filter((g) => mesDeFecha(g.fecha) === mes).reduce((sum, g) => sum + g.monto, 0),
  }));
}

/** Gastos agrupados por categoría; incluye todas las categorías activas (aunque estén en 0) para que el gráfico sea comparable entre períodos. */
export function calcularGastosPorCategoria(
  gastos: GastoRow[],
  categorias: CategoriaGastoRow[],
  rango: RangoFechas,
): ExpenseCategoryPoint[] {
  const gastosEnRango = filtrarGastosPorRango(gastos, rango);
  return categorias
    .filter((c) => c.activo)
    .map((categoria) => ({
      categoriaId: categoria.id,
      categoria: categoria.nombre,
      monto: gastosEnRango.filter((g) => g.categoria_id === categoria.id).reduce((sum, g) => sum + g.monto, 0),
    }))
    .sort((a, b) => b.monto - a.monto);
}

const TIPO_INGRESO_LABEL: Record<TipoIngreso, string> = {
  animal: "Venta de animales",
  producto: "Venta de productos",
  otro: "Otros",
};

/** Ingresos por tipo de línea, a partir de `detalle_ventas` de ventas completadas dentro del rango (sección 15: no crea otra fuente de ingresos). */
export function calcularIngresosPorTipo(
  ventas: VentaRow[],
  lineas: Pick<DetalleVentaRow, "venta_id" | "tipo" | "subtotal">[],
  rango: RangoFechas,
): IncomeTypePoint[] {
  const idsCompletadas = new Set(filtrarVentasCompletadas(ventas, rango).map((v) => v.id));
  const lineasValidas = lineas.filter((l) => idsCompletadas.has(l.venta_id));

  return (Object.keys(TIPO_INGRESO_LABEL) as TipoIngreso[]).map((tipo) => ({
    tipo,
    label: TIPO_INGRESO_LABEL[tipo],
    monto: lineasValidas.filter((l) => l.tipo === tipo).reduce((sum, l) => sum + l.subtotal, 0),
  }));
}

export function calcularAnimalFinancialStats(gastos: GastoConReferencias[]) {
  const ordenados = [...gastos].sort((a, b) => b.fecha.localeCompare(a.fecha));
  return {
    cantidadGastos: gastos.length,
    totalGastado: gastos.reduce((sum, g) => sum + g.monto, 0),
    ultimosGastos: ordenados.slice(0, 5),
  };
}

export function calcularSupplierFinancialStats(compras: CompraRow[], gastos: GastoRow[]) {
  return {
    numeroCompras: compras.length,
    totalComprado: compras.filter((c) => c.estado === "recibida").reduce((sum, c) => sum + c.total, 0),
    cantidadGastos: gastos.length,
    totalGastos: gastos.reduce((sum, g) => sum + g.monto, 0),
  };
}

/** Últimas operaciones (ventas, compras, gastos) mezcladas y ordenadas por fecha, para el Dashboard. */
export function construirUltimasOperaciones(
  ventas: VentaConCliente[],
  compras: CompraConProveedor[],
  gastos: GastoConReferencias[],
  limite = 5,
): OperacionReciente[] {
  const operaciones: OperacionReciente[] = [
    ...ventas.map((v) => ({
      id: v.id,
      tipo: "venta" as const,
      fecha: v.fecha,
      descripcion: `Venta ${formatearNumeroVenta(v.numero)} · ${v.cliente?.nombre ?? "Sin cliente"}`,
      monto: v.total,
      href: `/ventas/${v.id}`,
    })),
    ...compras.map((c) => ({
      id: c.id,
      tipo: "compra" as const,
      fecha: c.fecha,
      descripcion: `Compra ${formatearNumeroCompra(c.numero)} · ${c.proveedor?.nombre ?? "Sin proveedor"}`,
      monto: c.total,
      href: `/compras/${c.id}`,
    })),
    ...gastos.map((g) => ({
      id: g.id,
      tipo: "gasto" as const,
      fecha: g.fecha,
      descripcion: `${g.descripcion} · ${g.categoria?.nombre ?? "Sin categoría"}`,
      monto: g.monto,
      href: "/finanzas/gastos",
    })),
  ];

  return operaciones
    .sort((a, b) => b.fecha.localeCompare(a.fecha))
    .slice(0, limite);
}

/**
 * Criterio de la alerta de "gastos elevados" (sección 22): se compara el
 * total de gastos del período seleccionado contra el total de un período
 * inmediatamente anterior de la misma duración (ver `calcularPeriodoAnterior`).
 * La alerta se activa cuando el gasto actual supera al anterior — una
 * comparación direccional simple, sin umbrales porcentuales arbitrarios.
 * Se exige que el período anterior tenga gastos (> 0) para evitar que
 * cualquier primer gasto registrado dispare la alerta sin una base real de
 * comparación.
 */
export function evaluarAlertaGastos(gastoActual: number, gastoAnterior: number) {
  return {
    alerta: gastoAnterior > 0 && gastoActual > gastoAnterior,
    actual: gastoActual,
    anterior: gastoAnterior,
  };
}
