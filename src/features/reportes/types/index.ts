import type { ReactNode } from "react";

import type { EstadoAnimal, SexoAnimal } from "@/features/ganado/types";

// ----------------------------------------------------------------------------
// Resumen general
// ----------------------------------------------------------------------------

export interface ResumenGeneralData {
  totalAnimales: number;
  nacimientos: number;
  animalesVendidos: number;
  ingresos: number;
  compras: number;
  gastos: number;
  resultadoOperativo: number;
}

// ----------------------------------------------------------------------------
// Reporte de ganado
// ----------------------------------------------------------------------------

export interface LivestockReportStats {
  total: number;
  machos: number;
  hembras: number;
  activos: number;
  vendidos: number;
  fallecidos: number;
  nacimientosEnPeriodo: number;
}

export interface DistribucionPunto {
  clave: string;
  etiqueta: string;
  cantidad: number;
}

// ----------------------------------------------------------------------------
// Reporte de peso
// ----------------------------------------------------------------------------

export interface WeightReportStats {
  pesoPromedio: number | null;
  pesoMaximo: number | null;
  pesoMinimo: number | null;
  animalesPesados: number;
  cantidadPesajes: number;
}

// ----------------------------------------------------------------------------
// Reporte de salud
// ----------------------------------------------------------------------------

export interface HealthReportStats {
  vacunaciones: number;
  desparasitaciones: number;
  tratamientos: number;
  enfermedades: number;
  consultasVeterinarias: number;
  totalEventos: number;
}

export interface AnimalConEventosSalud {
  animalId: string;
  identificador: string;
  nombre: string | null;
  cantidad: number;
}

// ----------------------------------------------------------------------------
// Reporte de reproducción
// ----------------------------------------------------------------------------

export interface ReproductionReportStats {
  hembrasReproductivas: number;
  inseminaciones: number;
  gestacionesIniciadas: number;
  diagnosticos: number;
  diagnosticosPositivos: number;
  partos: number;
  nacimientos: number;
}

// ----------------------------------------------------------------------------
// Reporte de inventario
// ----------------------------------------------------------------------------

export interface InventoryMovementPoint {
  periodo: string;
  periodoLabel: string;
  entradas: number;
  salidas: number;
}

export interface ProductoMasUtilizado {
  productoId: string;
  nombre: string;
  unidadMedida: string;
  cantidadSalidas: number;
}

// ----------------------------------------------------------------------------
// Genérico: "top N" por monto (proveedores, clientes)
// ----------------------------------------------------------------------------

export interface TopEntry {
  id: string;
  nombre: string;
  monto: number;
  cantidad: number;
}

// ----------------------------------------------------------------------------
// Reporte de compras
// ----------------------------------------------------------------------------

export interface PurchasesReportPeriodStats {
  totalComprado: number;
  numeroCompras: number;
  recibidas: number;
  pendientes: number;
  canceladas: number;
}

// ----------------------------------------------------------------------------
// Reporte de ventas
// ----------------------------------------------------------------------------

export interface SalesReportPeriodStats {
  totalVendido: number;
  numeroVentas: number;
  animalesVendidos: number;
  productosVendidos: number;
  ventaPromedio: number | null;
}

// ----------------------------------------------------------------------------
// Reporte de gastos
// ----------------------------------------------------------------------------

export interface ExpensesReportPeriodStats {
  total: number;
  cantidad: number;
  promedio: number | null;
}

// ----------------------------------------------------------------------------
// Reporte de actividades
// ----------------------------------------------------------------------------

export interface ActivitiesReportStats {
  completadas: number;
  pendientes: number;
  canceladas: number;
  vencidas: number;
  total: number;
}

export interface ActivitiesTypePoint {
  clave: string;
  etiqueta: string;
  cantidad: number;
}

// ----------------------------------------------------------------------------
// Tabla y exportación genéricas
// ----------------------------------------------------------------------------

export interface ReportTableColumn<T> {
  header: string;
  cell: (row: T) => ReactNode;
  /** Valor plano usado al exportar a PDF/Excel; si se omite se usa `cell` convertido a texto. */
  exportValue?: (row: T) => string | number;
  className?: string;
}

export interface ExportColumn<T> {
  header: string;
  accessor: (row: T) => string | number;
}

export interface ReportExportConfig<T> {
  titulo: string;
  periodoLabel: string;
  columnas: ExportColumn<T>[];
  filas: T[];
  /** Nombre y logo de la finca (sección 4/18 de la Fase 12), para identificar el documento exportado. */
  nombreFinca?: string;
  logoUrl?: string | null;
}

export type { EstadoAnimal, SexoAnimal };
