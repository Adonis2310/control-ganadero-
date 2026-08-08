import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database.types";
import type { ProductoInventario } from "@/features/inventario/types";

type SupabaseDb = SupabaseClient<Database>;
type ProductoInsert = Database["public"]["Tables"]["productos_inventario"]["Insert"];
type ProductoUpdate = Database["public"]["Tables"]["productos_inventario"]["Update"];

const PRODUCTO_CON_CATEGORIA = "*, categoria:categorias_inventario(id, nombre)";

export const productosInventarioService = {
  async list(supabase: SupabaseDb): Promise<ProductoInventario[]> {
    const { data, error } = await supabase
      .from("productos_inventario")
      .select(PRODUCTO_CON_CATEGORIA)
      .order("nombre");

    if (error) throw error;
    return (data ?? []) as unknown as ProductoInventario[];
  },

  async getById(supabase: SupabaseDb, id: string): Promise<ProductoInventario | null> {
    const { data, error } = await supabase
      .from("productos_inventario")
      .select(PRODUCTO_CON_CATEGORIA)
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    return data as unknown as ProductoInventario | null;
  },

  /** Crea el producto con stock_actual = 0; el stock inicial se siembra como un movimiento de entrada aparte. */
  async create(supabase: SupabaseDb, payload: Omit<ProductoInsert, "stock_actual">): Promise<{ id: string }> {
    const { data, error } = await supabase
      .from("productos_inventario")
      .insert({ ...payload, stock_actual: 0 })
      .select("id")
      .single();

    if (error) throw error;
    return data;
  },

  /** No acepta stock_actual: el stock solo cambia a través de movimientos (entrada/salida/ajuste). */
  async update(
    supabase: SupabaseDb,
    id: string,
    payload: Omit<ProductoUpdate, "stock_actual">,
  ): Promise<void> {
    const { error } = await supabase.from("productos_inventario").update(payload).eq("id", id);
    if (error) throw error;
  },

  async setActivo(supabase: SupabaseDb, id: string, activo: boolean): Promise<void> {
    const { error } = await supabase.from("productos_inventario").update({ activo }).eq("id", id);
    if (error) throw error;
  },
};
