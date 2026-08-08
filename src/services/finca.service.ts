import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database.types";
import { FARM_NAME } from "@/lib/constants/farm";

type Finca = Database["public"]["Tables"]["finca"]["Row"];

export const fincaService = {
  /**
   * La app maneja una sola finca por administrador. Si todavía no existe
   * ningún registro (instalación nueva), crea uno con el nombre por defecto
   * para no bloquear el módulo de Ganado detrás de una pantalla de
   * configuración que no es parte de esta fase.
   */
  async getOrCreate(supabase: SupabaseClient<Database>): Promise<Finca> {
    const { data: existing, error } = await supabase
      .from("finca")
      .select("*")
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    if (existing) return existing;

    const { data: created, error: insertError } = await supabase
      .from("finca")
      .insert({ nombre: FARM_NAME })
      .select("*")
      .single();

    if (insertError) throw insertError;
    return created;
  },
};
