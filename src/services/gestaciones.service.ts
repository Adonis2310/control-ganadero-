import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database.types";
import type { GestacionRow } from "@/features/ganado/types";

type SupabaseDb = SupabaseClient<Database>;
type GestacionInsert = Database["public"]["Tables"]["gestaciones"]["Insert"];
type GestacionUpdate = Database["public"]["Tables"]["gestaciones"]["Update"];

const ESTADOS_ACTIVOS = ["en_seguimiento", "confirmada"] as const;

export const gestacionesService = {
  async listByAnimal(supabase: SupabaseDb, animalId: string): Promise<GestacionRow[]> {
    const { data, error } = await supabase
      .from("gestaciones")
      .select("*")
      .eq("animal_id", animalId)
      .order("fecha_inicio", { ascending: false });

    if (error) throw error;
    return data ?? [];
  },

  /** La gestación en curso (en seguimiento o confirmada) más reciente de un animal, si existe. */
  async getActivaByAnimal(supabase: SupabaseDb, animalId: string): Promise<GestacionRow | null> {
    const { data, error } = await supabase
      .from("gestaciones")
      .select("*")
      .eq("animal_id", animalId)
      .in("estado", ESTADOS_ACTIVOS)
      .order("fecha_inicio", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  /** Gestaciones de un conjunto de animales (página general y alertas del dashboard). */
  async listForFinca(supabase: SupabaseDb, animalIds: string[]): Promise<GestacionRow[]> {
    if (animalIds.length === 0) return [];
    const { data, error } = await supabase
      .from("gestaciones")
      .select("*")
      .in("animal_id", animalIds)
      .order("fecha_inicio", { ascending: false });

    if (error) throw error;
    return data ?? [];
  },

  async create(supabase: SupabaseDb, payload: GestacionInsert): Promise<GestacionRow> {
    const { data, error } = await supabase
      .from("gestaciones")
      .insert(payload)
      .select("*")
      .single();

    if (error) throw error;
    return data;
  },

  async update(supabase: SupabaseDb, id: string, payload: GestacionUpdate): Promise<void> {
    const { error } = await supabase.from("gestaciones").update(payload).eq("id", id);
    if (error) throw error;
  },

  async remove(supabase: SupabaseDb, id: string): Promise<void> {
    const { error } = await supabase.from("gestaciones").delete().eq("id", id);
    if (error) throw error;
  },
};
