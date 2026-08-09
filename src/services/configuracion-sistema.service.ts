import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database.types";

type ConfiguracionSistema = Database["public"]["Tables"]["configuracion_sistema"]["Row"];
type ConfiguracionSistemaUpdate = Database["public"]["Tables"]["configuracion_sistema"]["Update"];

export const configuracionSistemaService = {
  /**
   * La app maneja una sola configuración global (moneda, decimales, unidad de
   * peso, alertas, calendario) por instalación. Si todavía no existe ningún
   * registro, crea uno con los valores por defecto de la migración (mismo
   * patrón que `fincaService.getOrCreate`).
   */
  async getOrCreate(supabase: SupabaseClient<Database>): Promise<ConfiguracionSistema> {
    const { data: existing, error } = await supabase
      .from("configuracion_sistema")
      .select("*")
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    if (existing) return existing;

    const { data: created, error: insertError } = await supabase
      .from("configuracion_sistema")
      .insert({})
      .select("*")
      .single();

    if (insertError) throw insertError;
    return created;
  },

  async update(supabase: SupabaseClient<Database>, id: string, payload: ConfiguracionSistemaUpdate): Promise<ConfiguracionSistema> {
    const { data, error } = await supabase
      .from("configuracion_sistema")
      .update(payload)
      .eq("id", id)
      .select("*")
      .single();

    if (error) throw error;
    return data;
  },
};
