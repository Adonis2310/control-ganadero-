import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database.types";
import type { EventoReproductivoRow } from "@/features/ganado/types";

type SupabaseDb = SupabaseClient<Database>;
type EventoInsert = Database["public"]["Tables"]["eventos_reproductivos"]["Insert"];
type EventoUpdate = Database["public"]["Tables"]["eventos_reproductivos"]["Update"];

export const eventosReproductivosService = {
  async listByAnimal(supabase: SupabaseDb, animalId: string): Promise<EventoReproductivoRow[]> {
    const { data, error } = await supabase
      .from("eventos_reproductivos")
      .select("*")
      .eq("animal_id", animalId)
      .order("fecha", { ascending: false });

    if (error) throw error;
    return data ?? [];
  },

  /** Eventos donde este animal participó como macho (para las estadísticas del macho). */
  async listByMacho(supabase: SupabaseDb, machoId: string): Promise<EventoReproductivoRow[]> {
    const { data, error } = await supabase
      .from("eventos_reproductivos")
      .select("*")
      .eq("macho_id", machoId)
      .order("fecha", { ascending: false });

    if (error) throw error;
    return data ?? [];
  },

  /** Eventos de un conjunto de animales (página general y alertas del dashboard). */
  async listForFinca(supabase: SupabaseDb, animalIds: string[]): Promise<EventoReproductivoRow[]> {
    if (animalIds.length === 0) return [];
    const { data, error } = await supabase
      .from("eventos_reproductivos")
      .select("*")
      .in("animal_id", animalIds)
      .order("fecha", { ascending: false });

    if (error) throw error;
    return data ?? [];
  },

  async create(supabase: SupabaseDb, payload: EventoInsert): Promise<EventoReproductivoRow> {
    const { data, error } = await supabase
      .from("eventos_reproductivos")
      .insert(payload)
      .select("*")
      .single();

    if (error) throw error;
    return data;
  },

  async update(supabase: SupabaseDb, id: string, payload: EventoUpdate): Promise<void> {
    const { error } = await supabase.from("eventos_reproductivos").update(payload).eq("id", id);
    if (error) throw error;
  },

  async remove(supabase: SupabaseDb, id: string): Promise<void> {
    const { error } = await supabase.from("eventos_reproductivos").delete().eq("id", id);
    if (error) throw error;
  },
};
