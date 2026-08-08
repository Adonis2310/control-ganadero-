import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database.types";
import { movimientosInventarioService } from "@/services/movimientos-inventario.service";
import { productosInventarioService } from "@/services/productos-inventario.service";

type SupabaseDb = SupabaseClient<Database>;
type ProductoInsert = Database["public"]["Tables"]["productos_inventario"]["Insert"];

/** Se lanza cuando una salida pide más cantidad de la que hay en stock. */
export class StockInsuficienteError extends Error {
  constructor(disponible: number) {
    super(`No hay suficiente stock disponible (quedan ${disponible}).`);
    this.name = "StockInsuficienteError";
  }
}

export const inventarioService = {
  /** Crea el producto y, si se indicó stock inicial, lo siembra como un movimiento de entrada. */
  async crearProducto(
    supabase: SupabaseDb,
    payload: Omit<ProductoInsert, "stock_actual">,
    stockInicial: number | null,
  ): Promise<{ id: string }> {
    const producto = await productosInventarioService.create(supabase, payload);

    if (stockInicial !== null && stockInicial > 0) {
      await movimientosInventarioService.create(supabase, {
        producto_id: producto.id,
        tipo: "entrada",
        cantidad: stockInicial,
        costo_unitario: payload.costo_unitario ?? null,
        fecha: new Date().toISOString().split("T")[0],
        motivo: "Stock inicial",
        observaciones: "Registrado al crear el producto.",
      });
    }

    return producto;
  },

  async registrarEntrada(
    supabase: SupabaseDb,
    productoId: string,
    values: {
      fecha: string;
      cantidad: number;
      costoUnitario: number | null;
      motivo: string;
      observaciones: string | null;
    },
  ): Promise<void> {
    await movimientosInventarioService.create(supabase, {
      producto_id: productoId,
      tipo: "entrada",
      cantidad: values.cantidad,
      costo_unitario: values.costoUnitario,
      fecha: values.fecha,
      motivo: values.motivo,
      observaciones: values.observaciones,
    });
  },

  async registrarSalida(
    supabase: SupabaseDb,
    productoId: string,
    values: { fecha: string; cantidad: number; motivo: string; observaciones: string | null },
  ): Promise<void> {
    const producto = await productosInventarioService.getById(supabase, productoId);
    if (!producto || values.cantidad > producto.stock_actual) {
      throw new StockInsuficienteError(producto?.stock_actual ?? 0);
    }

    await movimientosInventarioService.create(supabase, {
      producto_id: productoId,
      tipo: "salida",
      cantidad: values.cantidad,
      fecha: values.fecha,
      motivo: values.motivo,
      observaciones: values.observaciones,
    });
  },

  /** Registra la diferencia entre el stock físico real y el stock del sistema como un movimiento de ajuste. */
  async registrarAjuste(
    supabase: SupabaseDb,
    productoId: string,
    values: { nuevaCantidad: number; motivo: string; observaciones: string | null },
  ): Promise<{ sinCambios: boolean }> {
    const producto = await productosInventarioService.getById(supabase, productoId);
    if (!producto) throw new Error("El producto no existe.");

    const delta = Number((values.nuevaCantidad - producto.stock_actual).toFixed(2));
    if (delta === 0) return { sinCambios: true };

    await movimientosInventarioService.create(supabase, {
      producto_id: productoId,
      tipo: "ajuste",
      cantidad: delta,
      fecha: new Date().toISOString().split("T")[0],
      motivo: values.motivo,
      observaciones: values.observaciones,
    });

    return { sinCambios: false };
  },
};
