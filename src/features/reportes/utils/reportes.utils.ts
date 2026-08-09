import type { RangoFechas } from "@/features/finanzas/types";
import {
  calcularResumenFinanciero,
  filtrarComprasRecibidas,
  filtrarGastosPorRango,
  filtrarVentasCompletadas,
} from "@/features/finanzas/utils/finanzas.utils";
import type { GastoRow } from "@/features/finanzas/types";
import type { CompraConProveedor, CompraRow } from "@/features/compras/types";
import type { DetalleVentaRow, VentaConCliente, VentaRow } from "@/features/ventas/types";
import type { Animal } from "@/features/ganado/types";
import type { PesoConAnimal } from "@/features/ganado/types";
import type { RegistroSalud } from "@/features/ganado/types";
import type { EventoReproductivoRow, GestacionRow } from "@/features/ganado/types";
import type { MovimientoConProducto } from "@/features/inventario/types";
import type { ActividadRow } from "@/features/calendario/types";
import { TIPO_ACTIVIDAD_LABEL, esVencida } from "@/features/calendario/utils/actividad.utils";
import type {
  ActivitiesReportStats,
  ActivitiesTypePoint,
  AnimalConEventosSalud,
  DistribucionPunto,
  ExpensesReportPeriodStats,
  HealthReportStats,
  InventoryMovementPoint,
  LivestockReportStats,
  ProductoMasUtilizado,
  PurchasesReportPeriodStats,
  ReproductionReportStats,
  ResumenGeneralData,
  SalesReportPeriodStats,
  TopEntry,
  WeightReportStats,
} from "@/features/reportes/types";

/** Mensaje estándar cuando una métrica no puede calcularse con los datos disponibles (sección 24: no inventar valores). */
export const SIN_DATOS_SUFICIENTES = "No hay datos suficientes para calcular esta métrica.";

export function dentroDeRango(fecha: string, rango: RangoFechas): boolean {
  return fecha >= rango.desde && fecha <= rango.hasta;
}

// ----------------------------------------------------------------------------
// Resumen general
// ----------------------------------------------------------------------------

export function calcularResumenGeneral(
  animales: Pick<Animal, "id" | "estado" | "fecha_nacimiento">[],
  ventas: VentaRow[],
  lineasVenta: Pick<DetalleVentaRow, "venta_id" | "tipo">[],
  compras: CompraRow[],
  gastos: GastoRow[],
  rango: RangoFechas,
): ResumenGeneralData {
  const financiero = calcularResumenFinanciero(ventas, compras, gastos, rango);
  const ventasEnRango = filtrarVentasCompletadas(ventas, rango);
  const idsVentasEnRango = new Set(ventasEnRango.map((v) => v.id));

  return {
    totalAnimales: animales.filter((a) => a.estado === "activo").length,
    nacimientos: animales.filter((a) => a.fecha_nacimiento && dentroDeRango(a.fecha_nacimiento, rango)).length,
    animalesVendidos: lineasVenta.filter((l) => l.tipo === "animal" && idsVentasEnRango.has(l.venta_id)).length,
    ingresos: financiero.ingresos,
    compras: financiero.compras,
    gastos: financiero.gastos,
    resultadoOperativo: financiero.resultadoOperativo,
  };
}

// ----------------------------------------------------------------------------
// Reporte de ganado
// ----------------------------------------------------------------------------

export function calcularLivestockReportStats(animales: Animal[], rango: RangoFechas): LivestockReportStats {
  return {
    total: animales.length,
    machos: animales.filter((a) => a.sexo === "macho").length,
    hembras: animales.filter((a) => a.sexo === "hembra").length,
    activos: animales.filter((a) => a.estado === "activo").length,
    vendidos: animales.filter((a) => a.estado === "vendido").length,
    fallecidos: animales.filter((a) => a.estado === "fallecido").length,
    nacimientosEnPeriodo: animales.filter((a) => a.fecha_nacimiento && dentroDeRango(a.fecha_nacimiento, rango)).length,
  };
}

export function calcularDistribucionPorSexo(animales: Animal[]): DistribucionPunto[] {
  return [
    { clave: "macho", etiqueta: "Machos", cantidad: animales.filter((a) => a.sexo === "macho").length },
    { clave: "hembra", etiqueta: "Hembras", cantidad: animales.filter((a) => a.sexo === "hembra").length },
  ];
}

export function calcularDistribucionPorEstado(animales: Animal[]): DistribucionPunto[] {
  const etiquetas: Record<string, string> = {
    activo: "Activos",
    vendido: "Vendidos",
    fallecido: "Fallecidos",
    transferido: "Transferidos",
  };
  return Object.entries(etiquetas)
    .map(([clave, etiqueta]) => ({
      clave,
      etiqueta,
      cantidad: animales.filter((a) => a.estado === clave).length,
    }))
    .filter((punto) => punto.cantidad > 0);
}

export function calcularDistribucionPorRaza(animales: Animal[]): DistribucionPunto[] {
  const porRaza = new Map<string, { etiqueta: string; cantidad: number }>();
  for (const animal of animales) {
    const clave = animal.raza?.id ?? "sin_raza";
    const etiqueta = animal.raza?.nombre ?? "Sin raza registrada";
    const actual = porRaza.get(clave) ?? { etiqueta, cantidad: 0 };
    actual.cantidad += 1;
    porRaza.set(clave, actual);
  }
  return Array.from(porRaza.entries())
    .map(([clave, valor]) => ({ clave, ...valor }))
    .sort((a, b) => b.cantidad - a.cantidad);
}

// ----------------------------------------------------------------------------
// Reporte de peso
// ----------------------------------------------------------------------------

export function calcularWeightReportStats(pesos: PesoConAnimal[], rango: RangoFechas): WeightReportStats {
  const enRango = pesos.filter((p) => dentroDeRango(p.fecha, rango));

  if (enRango.length === 0) {
    return { pesoPromedio: null, pesoMaximo: null, pesoMinimo: null, animalesPesados: 0, cantidadPesajes: 0 };
  }

  const valores = enRango.map((p) => p.peso);
  const promedio = valores.reduce((sum, v) => sum + v, 0) / valores.length;

  return {
    pesoPromedio: Number(promedio.toFixed(1)),
    pesoMaximo: Math.max(...valores),
    pesoMinimo: Math.min(...valores),
    animalesPesados: new Set(enRango.map((p) => p.animal_id)).size,
    cantidadPesajes: enRango.length,
  };
}

// ----------------------------------------------------------------------------
// Reporte de salud
// ----------------------------------------------------------------------------

export function calcularHealthReportStats(
  registros: RegistroSalud[],
  actividades: Pick<ActividadRow, "tipo" | "fecha">[],
  rango: RangoFechas,
): HealthReportStats {
  const enRango = registros.filter((r) => dentroDeRango(r.fecha, rango));
  const consultasEnRango = actividades.filter((a) => a.tipo === "consulta_veterinaria" && dentroDeRango(a.fecha, rango));

  return {
    vacunaciones: enRango.filter((r) => r.tipo === "vacuna").length,
    desparasitaciones: enRango.filter((r) => r.tipo === "desparasitacion").length,
    tratamientos: enRango.filter((r) => r.tipo === "tratamiento").length,
    enfermedades: enRango.filter((r) => r.tipo === "enfermedad").length,
    consultasVeterinarias: consultasEnRango.length,
    totalEventos: enRango.length,
  };
}

export function calcularAnimalesConMasEventosSalud(registros: RegistroSalud[], rango: RangoFechas, limite = 5): AnimalConEventosSalud[] {
  const enRango = registros.filter((r) => dentroDeRango(r.fecha, rango) && r.animal);
  const porAnimal = new Map<string, AnimalConEventosSalud>();

  for (const registro of enRango) {
    if (!registro.animal) continue;
    const actual = porAnimal.get(registro.animalId) ?? {
      animalId: registro.animalId,
      identificador: registro.animal.identificador,
      nombre: registro.animal.nombre,
      cantidad: 0,
    };
    actual.cantidad += 1;
    porAnimal.set(registro.animalId, actual);
  }

  return Array.from(porAnimal.values())
    .sort((a, b) => b.cantidad - a.cantidad)
    .slice(0, limite);
}

// ----------------------------------------------------------------------------
// Reporte de reproducción
// ----------------------------------------------------------------------------

export function calcularReproductionReportStats(
  hembras: number,
  gestaciones: GestacionRow[],
  eventos: EventoReproductivoRow[],
  rango: RangoFechas,
): ReproductionReportStats {
  const eventosEnRango = eventos.filter((e) => dentroDeRango(e.fecha, rango));
  const gestacionesEnRango = gestaciones.filter((g) => dentroDeRango(g.fecha_inicio, rango));
  const diagnosticosEnRango = eventosEnRango.filter((e) => e.tipo === "diagnostico");
  const partosEnRango = eventosEnRango.filter((e) => e.tipo === "parto");

  return {
    hembrasReproductivas: hembras,
    inseminaciones: eventosEnRango.filter((e) => e.tipo === "inseminacion").length,
    gestacionesIniciadas: gestacionesEnRango.length,
    diagnosticos: diagnosticosEnRango.length,
    diagnosticosPositivos: diagnosticosEnRango.filter((e) => e.resultado_diagnostico === "positivo").length,
    partos: partosEnRango.length,
    nacimientos: partosEnRango.reduce((sum, e) => sum + (e.numero_crias ?? 0), 0),
  };
}

// ----------------------------------------------------------------------------
// Reporte de inventario
// ----------------------------------------------------------------------------

function mesDeFechaLocal(fecha: string): string {
  return fecha.slice(0, 7);
}

/** Movimientos de inventario (entradas vs salidas) agrupados por mes dentro del rango. */
export function calcularMovimientosPorPeriodo(
  movimientos: MovimientoConProducto[],
  meses: { mes: string; mesLabel: string }[],
): InventoryMovementPoint[] {
  return meses.map(({ mes, mesLabel }) => {
    const delMes = movimientos.filter((m) => mesDeFechaLocal(m.fecha) === mes);
    return {
      periodo: mes,
      periodoLabel: mesLabel,
      entradas: delMes.filter((m) => m.tipo === "entrada").reduce((sum, m) => sum + m.cantidad, 0),
      salidas: delMes.filter((m) => m.tipo === "salida").reduce((sum, m) => sum + m.cantidad, 0),
    };
  });
}

export function calcularProductosMasUtilizados(
  movimientos: MovimientoConProducto[],
  rango: RangoFechas,
  limite = 5,
): ProductoMasUtilizado[] {
  const salidasEnRango = movimientos.filter((m) => m.tipo === "salida" && dentroDeRango(m.fecha, rango) && m.producto);
  const porProducto = new Map<string, ProductoMasUtilizado>();

  for (const movimiento of salidasEnRango) {
    if (!movimiento.producto) continue;
    const actual = porProducto.get(movimiento.producto.id) ?? {
      productoId: movimiento.producto.id,
      nombre: movimiento.producto.nombre,
      unidadMedida: movimiento.producto.unidad_medida,
      cantidadSalidas: 0,
    };
    actual.cantidadSalidas += movimiento.cantidad;
    porProducto.set(movimiento.producto.id, actual);
  }

  return Array.from(porProducto.values())
    .sort((a, b) => b.cantidadSalidas - a.cantidadSalidas)
    .slice(0, limite);
}

// ----------------------------------------------------------------------------
// Reporte de compras
// ----------------------------------------------------------------------------

export function calcularPurchasesReportStats(compras: CompraRow[], rango: RangoFechas): PurchasesReportPeriodStats {
  const enRango = compras.filter((c) => dentroDeRango(c.fecha, rango));
  return {
    totalComprado: filtrarComprasRecibidas(compras, rango).reduce((sum, c) => sum + c.total, 0),
    numeroCompras: enRango.length,
    recibidas: enRango.filter((c) => c.estado === "recibida").length,
    pendientes: enRango.filter((c) => c.estado === "pendiente").length,
    canceladas: enRango.filter((c) => c.estado === "cancelada").length,
  };
}

export function calcularTopProveedores(compras: CompraConProveedor[], rango: RangoFechas, limite = 5): TopEntry[] {
  // No se reutiliza `filtrarComprasRecibidas` aquí: su tipo de retorno (CompraRow[])
  // perdería el campo `proveedor` embebido que este cálculo necesita. El criterio
  // de filtrado (recibida + dentro del rango) es exactamente el mismo.
  const recibidasEnRango = compras.filter((c) => c.estado === "recibida" && dentroDeRango(c.fecha, rango));
  const porProveedor = new Map<string, TopEntry>();

  for (const compra of recibidasEnRango) {
    if (!compra.proveedor) continue;
    const actual = porProveedor.get(compra.proveedor.id) ?? {
      id: compra.proveedor.id,
      nombre: compra.proveedor.nombre,
      monto: 0,
      cantidad: 0,
    };
    actual.monto += compra.total;
    actual.cantidad += 1;
    porProveedor.set(compra.proveedor.id, actual);
  }

  return Array.from(porProveedor.values())
    .sort((a, b) => b.monto - a.monto)
    .slice(0, limite);
}

// ----------------------------------------------------------------------------
// Reporte de ventas
// ----------------------------------------------------------------------------

export function calcularSalesReportStats(
  ventas: VentaRow[],
  lineas: Pick<DetalleVentaRow, "venta_id" | "tipo">[],
  rango: RangoFechas,
): SalesReportPeriodStats {
  const completadasEnRango = filtrarVentasCompletadas(ventas, rango);
  const enRango = ventas.filter((v) => dentroDeRango(v.fecha, rango));
  const ids = new Set(completadasEnRango.map((v) => v.id));
  const totalVendido = completadasEnRango.reduce((sum, v) => sum + v.total, 0);

  return {
    totalVendido,
    numeroVentas: enRango.length,
    animalesVendidos: lineas.filter((l) => l.tipo === "animal" && ids.has(l.venta_id)).length,
    productosVendidos: lineas.filter((l) => l.tipo === "producto" && ids.has(l.venta_id)).length,
    ventaPromedio: completadasEnRango.length > 0 ? Number((totalVendido / completadasEnRango.length).toFixed(2)) : null,
  };
}

export function calcularTopClientes(ventas: VentaConCliente[], rango: RangoFechas, limite = 5): TopEntry[] {
  // Igual que en `calcularTopProveedores`: se filtra localmente para conservar el
  // campo `cliente` embebido (mismo criterio que `filtrarVentasCompletadas`).
  const completadasEnRango = ventas.filter((v) => v.estado === "completada" && dentroDeRango(v.fecha, rango));
  const porCliente = new Map<string, TopEntry>();

  for (const venta of completadasEnRango) {
    if (!venta.cliente) continue;
    const actual = porCliente.get(venta.cliente.id) ?? {
      id: venta.cliente.id,
      nombre: venta.cliente.nombre,
      monto: 0,
      cantidad: 0,
    };
    actual.monto += venta.total;
    actual.cantidad += 1;
    porCliente.set(venta.cliente.id, actual);
  }

  return Array.from(porCliente.values())
    .sort((a, b) => b.monto - a.monto)
    .slice(0, limite);
}

// ----------------------------------------------------------------------------
// Reporte de gastos
// ----------------------------------------------------------------------------

export function calcularExpensesReportStats(gastos: GastoRow[], rango: RangoFechas): ExpensesReportPeriodStats {
  const enRango = filtrarGastosPorRango(gastos, rango);
  const total = enRango.reduce((sum, g) => sum + g.monto, 0);
  return {
    total,
    cantidad: enRango.length,
    promedio: enRango.length > 0 ? Number((total / enRango.length).toFixed(2)) : null,
  };
}

// ----------------------------------------------------------------------------
// Reporte de actividades
// ----------------------------------------------------------------------------

export function calcularActivitiesReportStats(actividades: ActividadRow[], rango: RangoFechas): ActivitiesReportStats {
  const enRango = actividades.filter((a) => dentroDeRango(a.fecha, rango));
  return {
    completadas: enRango.filter((a) => a.estado === "completada").length,
    pendientes: enRango.filter((a) => a.estado === "pendiente" || a.estado === "en_progreso").length,
    canceladas: enRango.filter((a) => a.estado === "cancelada").length,
    vencidas: enRango.filter(esVencida).length,
    total: enRango.length,
  };
}

/** Agrupación visual de los 13 tipos reales de actividad en las categorías del reporte (sin inventar tipos que no existen). */
const GRUPO_TIPO_ACTIVIDAD: Record<string, string> = {
  vacunacion: "Vacunación",
  desparasitacion: "Desparasitación",
  tratamiento: "Tratamiento",
  consulta_veterinaria: "Consulta veterinaria",
  pesaje: "Pesaje",
  inseminacion: "Reproducción",
  revision_reproductiva: "Reproducción",
  diagnostico_prenez: "Reproducción",
  parto: "Reproducción",
  alimentacion: "Alimentación",
  mantenimiento: "Mantenimiento",
  compra: "Compra",
  otro: "Otro",
};

export function calcularActivitiesPorTipo(actividades: ActividadRow[], rango: RangoFechas): ActivitiesTypePoint[] {
  const enRango = actividades.filter((a) => dentroDeRango(a.fecha, rango));
  const porGrupo = new Map<string, number>();

  for (const actividad of enRango) {
    const grupo = GRUPO_TIPO_ACTIVIDAD[actividad.tipo] ?? TIPO_ACTIVIDAD_LABEL[actividad.tipo];
    porGrupo.set(grupo, (porGrupo.get(grupo) ?? 0) + 1);
  }

  return Array.from(porGrupo.entries())
    .map(([clave, cantidad]) => ({ clave, etiqueta: clave, cantidad }))
    .sort((a, b) => b.cantidad - a.cantidad);
}
