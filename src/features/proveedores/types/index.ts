import type { Database } from "@/types/database.types";

export type ProveedorRow = Database["public"]["Tables"]["proveedores"]["Row"];

/** Referencia mínima a un proveedor, usada en compras y en selects. */
export interface ProveedorRef {
  id: string;
  nombre: string;
  empresa: string | null;
}

export const TIPO_PROVEEDOR_OPTIONS = [
  "Agroservicio",
  "Veterinaria",
  "Alimentación",
  "Medicamentos",
  "Herramientas",
  "Otro",
] as const;

export interface ProveedorFilters {
  search: string;
  tipo: string | "todos";
  activo: "activos" | "inactivos" | "todos";
}

export const DEFAULT_PROVEEDOR_FILTERS: ProveedorFilters = {
  search: "",
  tipo: "todos",
  activo: "activos",
};

export interface ProveedorStats {
  totalComprado: number;
  numeroCompras: number;
  ultimaCompra: string | null;
}
