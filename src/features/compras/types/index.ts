import type { Database } from "@/types/database.types";
import type { ProveedorRef } from "@/features/proveedores/types";

export type CompraRow = Database["public"]["Tables"]["compras"]["Row"];
export type DetalleCompraRow = Database["public"]["Tables"]["detalle_compras"]["Row"];
export type EstadoCompra = CompraRow["estado"];

/** Referencia mínima a un producto, usada en las líneas de una compra. */
export interface ProductoCompraRef {
  id: string;
  nombre: string;
  unidad_medida: string;
}

export interface DetalleCompraConProducto extends DetalleCompraRow {
  producto: ProductoCompraRef | null;
}

export interface CompraConProveedor extends CompraRow {
  proveedor: ProveedorRef | null;
}

export interface CompraCompleta extends CompraConProveedor {
  lineas: DetalleCompraConProducto[];
}

/** Una línea de compra con la compra (y su proveedor) resuelta, para el historial de compras de un producto. */
export interface DetalleCompraConCompra extends DetalleCompraRow {
  compra: CompraConProveedor | null;
}

/** Una línea tal como la arma el formulario, antes de enviarla al RPC. */
export interface LineaCompraInput {
  producto_id: string;
  cantidad: number;
  costo_unitario: number;
  descuento: number;
}

export const ESTADO_COMPRA_OPTIONS: { value: EstadoCompra; label: string }[] = [
  { value: "borrador", label: "Borrador" },
  { value: "pendiente", label: "Pendiente" },
  { value: "recibida", label: "Recibida" },
  { value: "cancelada", label: "Cancelada" },
];

export interface PurchaseStats {
  totalCompras: number;
  totalGastado: number;
  pendientes: number;
  recibidas: number;
  comprasDelMes: number;
}

export interface CompraFilters {
  search: string;
  proveedorId: string | "todos";
  estado: EstadoCompra | "todos";
  desde: string;
  hasta: string;
}

export const DEFAULT_COMPRA_FILTERS: CompraFilters = {
  search: "",
  proveedorId: "todos",
  estado: "todos",
  desde: "",
  hasta: "",
};
