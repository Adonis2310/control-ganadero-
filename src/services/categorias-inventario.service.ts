import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database.types";
import type { CategoriaInventario } from "@/features/inventario/types";

export const categoriasInventarioService = {
  async list(supabase: SupabaseClient<Database>): Promise<CategoriaInventario[]> {
    const { data, error } = await supabase
      .from("categorias_inventario")
      .select("*")
      .order("nombre");

    if (error) throw error;
    return data ?? [];
  },
};
