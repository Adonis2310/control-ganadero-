import type { Database } from "@/types/database.types";
import type { ClienteRef } from "@/features/clientes/types";

export type VentaRow = Database["public"]["Tables"]["ventas"]["Row"];
export type DetalleVentaRow = Database["public"]["Tables"]["detalle_ventas"]["Row"];
export type EstadoVenta = VentaRow["estado"];
export type TipoDetalleVenta = DetalleVentaRow["tipo"];

export interface ProductoVentaRef {
  id: string;
  nombre: string;
  unidad_medida: string;
}

export interface AnimalVentaRef {
  id: string;
  identificador: string;
  nombre: string | null;
}

export interface DetalleVentaConReferencias extends DetalleVentaRow {
  producto: ProductoVentaRef | null;
  animal: AnimalVentaRef | null;
}

/** Animal disponible para vender, con los datos que debe mostrar el selector (sección 9 de la Fase 8). */
export interface SellableAnimalRef {
  id: string;
  identificador: string;
  nombre: string | null;
  sexo: "macho" | "hembra";
  raza: string | null;
  peso_actual_kg: number | null;
}

/** Producto disponible para vender, con el stock que debe mostrar el selector. */
export interface SellableProductRef {
  id: string;
  nombre: string;
  unidad_medida: string;
  stock_actual: number;
}

export interface VentaConCliente extends VentaRow {
  cliente: ClienteRef | null;
}

export interface VentaCompleta extends VentaConCliente {
  lineas: DetalleVentaConReferencias[];
}

/** Una línea tal como la arma el formulario, antes de enviarla al RPC. */
export interface LineaVentaInput {
  tipo: TipoDetalleVenta;
  producto_id: string | null;
  animal_id: string | null;
  descripcion: string | null;
  cantidad: number;
  precio_unitario: number;
  descuento: number;
}

export const METODO_PAGO_OPTIONS = ["Efectivo", "Transferencia", "Tarjeta", "Otro"] as const;

export const ESTADO_VENTA_OPTIONS: { value: EstadoVenta; label: string }[] = [
  { value: "borrador", label: "Borrador" },
  { value: "pendiente", label: "Pendiente" },
  { value: "completada", label: "Completada" },
  { value: "cancelada", label: "Cancelada" },
];

export const TIPO_DETALLE_VENTA_OPTIONS: { value: TipoDetalleVenta; label: string }[] = [
  { value: "animal", label: "Animal" },
  { value: "producto", label: "Producto" },
  { value: "otro", label: "Otro" },
];

export interface SalesStats {
  totalVendido: number;
  ventasDelMes: number;
  ingresosDelMes: number;
  completadas: number;
  pendientes: number;
  canceladas: number;
  animalesVendidos: number;
  productosVendidos: number;
}

export interface VentaFilters {
  search: string;
  clienteId: string | "todos";
  estado: EstadoVenta | "todos";
  metodoPago: string | "todos";
  tipo: TipoDetalleVenta | "todos";
  desde: string;
  hasta: string;
}

export const DEFAULT_VENTA_FILTERS: VentaFilters = {
  search: "",
  clienteId: "todos",
  estado: "todos",
  metodoPago: "todos",
  tipo: "todos",
  desde: "",
  hasta: "",
};

/** Línea de venta (tipo animal) con la venta y el cliente resueltos, para la ficha del animal. */
export interface AnimalVentaInfo extends DetalleVentaRow {
  venta: VentaConCliente;
}

/** Una línea de venta (tipo producto) con la venta resuelta, para el historial de ventas de un producto. */
export interface DetalleVentaConVenta extends DetalleVentaRow {
  venta: VentaConCliente | null;
}
