import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database.types";
import type { VacunaRow } from "@/features/ganado/types";

type SupabaseDb = SupabaseClient<Database>;
type VacunaInsert = Database["public"]["Tables"]["vacunas"]["Insert"];
type VacunaUpdate = Database["public"]["Tables"]["vacunas"]["Update"];

export const vacunasService = {
  async listByAnimal(supabase: SupabaseDb, animalId: string): Promise<VacunaRow[]> {
    const { data, error } = await supabase
      .from("vacunas")
      .select("*")
      .eq("animal_id", animalId)
      .order("fecha_aplicacion", { ascending: false });

    if (error) throw error;
    return data ?? [];
  },

  /** Vacunas de un conjunto de animales (usado por la página general y las alertas del dashboard). */
  async listForFinca(supabase: SupabaseDb, animalIds: string[]): Promise<VacunaRow[]> {
    if (animalIds.length === 0) return [];
    const { data, error } = await supabase
      .from("vacunas")
      .select("*")
      .in("animal_id", animalIds)
      .order("fecha_aplicacion", { ascending: false });

    if (error) throw error;
    return data ?? [];
  },

  async create(supabase: SupabaseDb, payload: VacunaInsert): Promise<void> {
    const { error } = await supabase.from("vacunas").insert(payload);
    if (error) throw error;
  },

  async update(supabase: SupabaseDb, id: string, payload: VacunaUpdate): Promise<void> {
    const { error } = await supabase.from("vacunas").update(payload).eq("id", id);
    if (error) throw error;
  },

  async remove(supabase: SupabaseDb, id: string): Promise<void> {
    const { error } = await supabase.from("vacunas").delete().eq("id", id);
    if (error) throw error;
  },
};
