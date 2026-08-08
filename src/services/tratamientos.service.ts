import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database.types";
import type { TratamientoConEnfermedad, TratamientoRow } from "@/features/ganado/types";

type SupabaseDb = SupabaseClient<Database>;
type TratamientoInsert = Database["public"]["Tables"]["tratamientos"]["Insert"];
type TratamientoUpdate = Database["public"]["Tables"]["tratamientos"]["Update"];

export const tratamientosService = {
  async listByAnimal(supabase: SupabaseDb, animalId: string): Promise<TratamientoConEnfermedad[]> {
    const { data, error } = await supabase
      .from("tratamientos")
      .select("*, enfermedad:enfermedades(id, enfermedad)")
      .eq("animal_id", animalId)
      .order("fecha_inicio", { ascending: false });

    if (error) throw error;
    return (data ?? []) as unknown as TratamientoConEnfermedad[];
  },

  /** Tratamientos de un conjunto de animales (usado por la página general y las alertas del dashboard). */
  async listForFinca(supabase: SupabaseDb, animalIds: string[]): Promise<TratamientoRow[]> {
    if (animalIds.length === 0) return [];
    const { data, error } = await supabase
      .from("tratamientos")
      .select("*")
      .in("animal_id", animalIds)
      .order("fecha_inicio", { ascending: false });

    if (error) throw error;
    return data ?? [];
  },

  async create(supabase: SupabaseDb, payload: TratamientoInsert): Promise<void> {
    const { error } = await supabase.from("tratamientos").insert(payload);
    if (error) throw error;
  },

  async update(supabase: SupabaseDb, id: string, payload: TratamientoUpdate): Promise<void> {
    const { error } = await supabase.from("tratamientos").update(payload).eq("id", id);
    if (error) throw error;
  },

  async remove(supabase: SupabaseDb, id: string): Promise<void> {
    const { error } = await supabase.from("tratamientos").delete().eq("id", id);
    if (error) throw error;
  },
};
