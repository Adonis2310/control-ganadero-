import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database.types";
import type { EnfermedadRow } from "@/features/ganado/types";

type SupabaseDb = SupabaseClient<Database>;
type EnfermedadInsert = Database["public"]["Tables"]["enfermedades"]["Insert"];
type EnfermedadUpdate = Database["public"]["Tables"]["enfermedades"]["Update"];

export const enfermedadesService = {
  async listByAnimal(supabase: SupabaseDb, animalId: string): Promise<EnfermedadRow[]> {
    const { data, error } = await supabase
      .from("enfermedades")
      .select("*")
      .eq("animal_id", animalId)
      .order("fecha_diagnostico", { ascending: false });

    if (error) throw error;
    return data ?? [];
  },

  /** Enfermedades de un conjunto de animales (usado por la página general y las alertas del dashboard). */
  async listForFinca(supabase: SupabaseDb, animalIds: string[]): Promise<EnfermedadRow[]> {
    if (animalIds.length === 0) return [];
    const { data, error } = await supabase
      .from("enfermedades")
      .select("*")
      .in("animal_id", animalIds)
      .order("fecha_diagnostico", { ascending: false });

    if (error) throw error;
    return data ?? [];
  },

  async create(supabase: SupabaseDb, payload: EnfermedadInsert): Promise<void> {
    const { error } = await supabase
      .from("enfermedades")
      .insert({ ...payload, estado: "activa" });
    if (error) throw error;
  },

  async update(supabase: SupabaseDb, id: string, payload: EnfermedadUpdate): Promise<void> {
    const { error } = await supabase.from("enfermedades").update(payload).eq("id", id);
    if (error) throw error;
  },

  async marcarRecuperada(
    supabase: SupabaseDb,
    id: string,
    fechaRecuperacion: string,
  ): Promise<void> {
    const { error } = await supabase
      .from("enfermedades")
      .update({ estado: "recuperado", fecha_recuperacion: fechaRecuperacion })
      .eq("id", id);
    if (error) throw error;
  },

  async remove(supabase: SupabaseDb, id: string): Promise<void> {
    const { error } = await supabase.from("enfermedades").delete().eq("id", id);
    if (error) throw error;
  },
};
