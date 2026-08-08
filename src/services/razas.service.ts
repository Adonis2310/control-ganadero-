import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database.types";
import type { Raza } from "@/features/ganado/types";

export const razasService = {
  async list(supabase: SupabaseClient<Database>): Promise<Raza[]> {
    const { data, error } = await supabase
      .from("razas")
      .select("*")
      .order("nombre");

    if (error) throw error;
    return data ?? [];
  },
};
