import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database.types";
import type { CategoriaGastoRow } from "@/features/finanzas/types";

type SupabaseDb = SupabaseClient<Database>;

export const categoriasGastosService = {
  async list(supabase: SupabaseDb): Promise<CategoriaGastoRow[]> {
    const { data, error } = await supabase.from("categorias_gastos").select("*").order("nombre");
    if (error) throw error;
    return data ?? [];
  },

  async listActivas(supabase: SupabaseDb): Promise<CategoriaGastoRow[]> {
    const { data, error } = await supabase
      .from("categorias_gastos")
      .select("*")
      .eq("activo", true)
      .order("nombre");
    if (error) throw error;
    return data ?? [];
  },
};
