import type { Database } from "@/types/database.types";

export type ClienteRow = Database["public"]["Tables"]["clientes"]["Row"];

/** Referencia mínima a un cliente, usada en ventas y selects. */
export interface ClienteRef {
  id: string;
  nombre: string;
  identificacion: string | null;
}

export interface ClienteFilters {
  search: string;
  activo: "activos" | "inactivos" | "todos";
}

export const DEFAULT_CLIENTE_FILTERS: ClienteFilters = {
  search: "",
  activo: "activos",
};

export interface ClienteStats {
  totalComprado: number;
  numeroOperaciones: number;
  ultimaCompra: string | null;
}
