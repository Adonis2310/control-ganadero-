import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database.types";
import type { MovimientoConProducto, MovimientoInventarioRow } from "@/features/inventario/types";

type SupabaseDb = SupabaseClient<Database>;
type MovimientoInsert = Database["public"]["Tables"]["movimientos_inventario"]["Insert"];

export const movimientosInventarioService = {
  async listByProducto(supabase: SupabaseDb, productoId: string): Promise<MovimientoInventarioRow[]> {
    const { data, error } = await supabase
      .from("movimientos_inventario")
      .select("*")
      .eq("producto_id", productoId)
      .order("fecha", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data ?? [];
  },

  /** Todos los movimientos de la finca, con el producto resuelto (página general de movimientos). */
  async listAll(supabase: SupabaseDb): Promise<MovimientoConProducto[]> {
    const { data, error } = await supabase
      .from("movimientos_inventario")
      .select("*, producto:productos_inventario(id, nombre, unidad_medida, categoria_id)")
      .order("fecha", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data ?? []) as unknown as MovimientoConProducto[];
  },

  async create(supabase: SupabaseDb, payload: MovimientoInsert): Promise<void> {
    const { error } = await supabase.from("movimientos_inventario").insert(payload);
    if (error) throw error;
  },
};
