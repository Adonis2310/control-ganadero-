import type { Database } from "@/types/database.types";

export type CategoriaInventario = Database["public"]["Tables"]["categorias_inventario"]["Row"];
export type ProductoInventarioRow = Database["public"]["Tables"]["productos_inventario"]["Row"];
export type MovimientoInventarioRow = Database["public"]["Tables"]["movimientos_inventario"]["Row"];
export type TipoMovimiento = MovimientoInventarioRow["tipo"];

/** Estado calculado (no almacenado) del stock de un producto, según stock_actual vs. stock_minimo. */
export type EstadoStock = "disponible" | "stock_bajo" | "agotado";

export const UNIDAD_MEDIDA_OPTIONS = [
  "Unidad",
  "Kilogramo",
  "Gramo",
  "Litro",
  "Mililitro",
  "Bolsa",
  "Caja",
  "Frasco",
] as const;

export type UnidadMedida = (typeof UNIDAD_MEDIDA_OPTIONS)[number];

/** Producto con su categoría resuelta, tal como se muestra en la UI. */
export interface ProductoInventario extends ProductoInventarioRow {
  categoria: Pick<CategoriaInventario, "id" | "nombre"> | null;
}

/** Referencia mínima a un producto, usada en el listado de movimientos. */
export interface ProductoRef {
  id: string;
  nombre: string;
  unidad_medida: string;
  categoria_id: string;
}

/** Movimiento con el producto resuelto, para la página general de movimientos. */
export interface MovimientoConProducto extends MovimientoInventarioRow {
  producto: ProductoRef | null;
}

export interface InventoryStats {
  totalProductos: number;
  stockBajo: number;
  agotados: number;
  valorEstimado: number;
}

export interface ProductoFilters {
  search: string;
  categoriaId: string | "todos";
  estadoStock: EstadoStock | "todos";
  unidadMedida: string | "todos";
  activo: "activos" | "inactivos" | "todos";
}

export const DEFAULT_PRODUCTO_FILTERS: ProductoFilters = {
  search: "",
  categoriaId: "todos",
  estadoStock: "todos",
  unidadMedida: "todos",
  activo: "activos",
};

export interface MovimientoFilters {
  search: string;
  productoId: string | "todos";
  categoriaId: string | "todos";
  tipo: TipoMovimiento | "todos";
  desde: string;
  hasta: string;
}

export const DEFAULT_MOVIMIENTO_FILTERS: MovimientoFilters = {
  search: "",
  productoId: "todos",
  categoriaId: "todos",
  tipo: "todos",
  desde: "",
  hasta: "",
};

export interface InventoryAlert {
  producto: ProductoRef;
  tipo: "stock_bajo" | "agotado";
}
