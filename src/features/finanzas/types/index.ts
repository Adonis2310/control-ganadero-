import type { Database } from "@/types/database.types";
import type { AnimalRef } from "@/features/ganado/types";
import type { ProveedorRef } from "@/features/proveedores/types";

export type CategoriaGastoRow = Database["public"]["Tables"]["categorias_gastos"]["Row"];
export type GastoRow = Database["public"]["Tables"]["gastos"]["Row"];

/** Referencia mínima a una categoría de gasto, usada en selects y listados. */
export interface CategoriaGastoRef {
  id: string;
  nombre: string;
}

export interface GastoConReferencias extends GastoRow {
  categoria: CategoriaGastoRef | null;
  proveedor: ProveedorRef | null;
  animal: AnimalRef | null;
}

export interface GastoFilters {
  search: string;
  categoriaId: string | "todas";
  metodoPago: string | "todos";
  desde: string;
  hasta: string;
}

export const DEFAULT_GASTO_FILTERS: GastoFilters = {
  search: "",
  categoriaId: "todas",
  metodoPago: "todos",
  desde: "",
  hasta: "",
};

// ----------------------------------------------------------------------------
// Período financiero
// ----------------------------------------------------------------------------

export const PERIODO_OPTIONS = [
  { value: "hoy", label: "Hoy" },
  { value: "semana", label: "Esta semana" },
  { value: "mes", label: "Este mes" },
  { value: "mes_anterior", label: "Mes anterior" },
  { value: "anio", label: "Este año" },
  { value: "personalizado", label: "Personalizado" },
] as const;

export type PeriodoFinanciero = (typeof PERIODO_OPTIONS)[number]["value"];

export interface RangoFechas {
  desde: string;
  hasta: string;
}

// ----------------------------------------------------------------------------
// Indicadores financieros
// ----------------------------------------------------------------------------

export interface FinancialSummaryData {
  ingresos: number;
  compras: number;
  gastos: number;
  egresosTotales: number;
  resultadoOperativo: number;
}

export interface IncomeExpenseMonthPoint {
  mes: string;
  mesLabel: string;
  ingresos: number;
  compras: number;
  gastos: number;
}

export interface ExpenseCategoryPoint {
  categoriaId: string;
  categoria: string;
  monto: number;
}

export type TipoIngreso = "animal" | "producto" | "otro";

export interface IncomeTypePoint {
  tipo: TipoIngreso;
  label: string;
  monto: number;
}

export interface AnimalFinancialStats {
  cantidadGastos: number;
  totalGastado: number;
  ultimosGastos: GastoConReferencias[];
}

export interface SupplierFinancialStats {
  numeroCompras: number;
  totalComprado: number;
  cantidadGastos: number;
  totalGastos: number;
}

export interface OperacionReciente {
  id: string;
  tipo: "venta" | "compra" | "gasto";
  fecha: string;
  descripcion: string;
  monto: number;
  href: string;
}
