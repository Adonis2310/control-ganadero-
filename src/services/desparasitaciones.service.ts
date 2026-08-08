import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database.types";
import type { DesparasitacionRow } from "@/features/ganado/types";

type SupabaseDb = SupabaseClient<Database>;
type DesparasitacionInsert = Database["public"]["Tables"]["desparasitaciones"]["Insert"];
type DesparasitacionUpdate = Database["public"]["Tables"]["desparasitaciones"]["Update"];

export const desparasitacionesService = {
  async listByAnimal(supabase: SupabaseDb, animalId: string): Promise<DesparasitacionRow[]> {
    const { data, error } = await supabase
      .from("desparasitaciones")
      .select("*")
      .eq("animal_id", animalId)
      .order("fecha_aplicacion", { ascending: false });

    if (error) throw error;
    return data ?? [];
  },

  /** Desparasitaciones de un conjunto de animales (usado por la página general y las alertas del dashboard). */
  async listForFinca(supabase: SupabaseDb, animalIds: string[]): Promise<DesparasitacionRow[]> {
    if (animalIds.length === 0) return [];
    const { data, error } = await supabase
      .from("desparasitaciones")
      .select("*")
      .in("animal_id", animalIds)
      .order("fecha_aplicacion", { ascending: false });

    if (error) throw error;
    return data ?? [];
  },

  async create(supabase: SupabaseDb, payload: DesparasitacionInsert): Promise<void> {
    const { error } = await supabase.from("desparasitaciones").insert(payload);
    if (error) throw error;
  },

  async update(supabase: SupabaseDb, id: string, payload: DesparasitacionUpdate): Promise<void> {
    const { error } = await supabase.from("desparasitaciones").update(payload).eq("id", id);
    if (error) throw error;
  },

  async remove(supabase: SupabaseDb, id: string): Promise<void> {
    const { error } = await supabase.from("desparasitaciones").delete().eq("id", id);
    if (error) throw error;
  },
};
