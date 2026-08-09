import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database.types";
import { FARM_NAME } from "@/lib/constants/farm";

type Finca = Database["public"]["Tables"]["finca"]["Row"];
type FincaUpdate = Database["public"]["Tables"]["finca"]["Update"];

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

  /** Actualiza los datos de la finca (información general, contacto, logo) desde /configuracion. */
  async update(supabase: SupabaseClient<Database>, id: string, payload: FincaUpdate): Promise<Finca> {
    const { data, error } = await supabase.from("finca").update(payload).eq("id", id).select("*").single();
    if (error) throw error;
    return data;
  },
};
