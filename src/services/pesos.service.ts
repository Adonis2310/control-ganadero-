import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database.types";
import type {
  PesoAnimalRef,
  PesoConAnimal,
  PesoFilters,
  PesoGeneralStats,
  PesoRow,
} from "@/features/ganado/types";

type SupabaseDb = SupabaseClient<Database>;
type PesoInsert = Database["public"]["Tables"]["pesos"]["Insert"];
type PesoUpdate = Database["public"]["Tables"]["pesos"]["Update"];

export const pesosService = {
  async listByAnimal(supabase: SupabaseDb, animalId: string): Promise<PesoRow[]> {
    const { data, error } = await supabase
      .from("pesos")
      .select("*")
      .eq("animal_id", animalId)
      .order("fecha", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) throw error;
    return data ?? [];
  },

  async create(supabase: SupabaseDb, payload: PesoInsert): Promise<void> {
    const { error } = await supabase.from("pesos").insert(payload);
    if (error) throw error;
  },

  async update(supabase: SupabaseDb, id: string, payload: PesoUpdate): Promise<void> {
    const { error } = await supabase.from("pesos").update(payload).eq("id", id);
    if (error) throw error;
  },

  async remove(supabase: SupabaseDb, id: string): Promise<void> {
    const { error } = await supabase.from("pesos").delete().eq("id", id);
    if (error) throw error;
  },

  /** Pesajes de toda la finca (para la página general), con el animal resuelto. */
  async listForFinca(
    supabase: SupabaseDb,
    fincaId: string,
    filters?: Partial<PesoFilters>,
  ): Promise<PesoConAnimal[]> {
    // animal_id no tiene finca_id directo; se filtra vía los animales de la finca.
    const { data: animalIds, error: animalesError } = await supabase
      .from("animales")
      .select("id")
      .eq("finca_id", fincaId);

    if (animalesError) throw animalesError;
    const ids = (animalIds ?? []).map((a) => a.id);
    if (ids.length === 0) return [];

    let query = supabase
      .from("pesos")
      .select("*, animal:animales(id, identificador, nombre)")
      .in("animal_id", ids)
      .order("fecha", { ascending: false })
      .order("created_at", { ascending: false });

    if (filters?.desde) query = query.gte("fecha", filters.desde);
    if (filters?.hasta) query = query.lte("fecha", filters.hasta);
    if (filters?.pesoMin) query = query.gte("peso", Number(filters.pesoMin));
    if (filters?.pesoMax) query = query.lte("peso", Number(filters.pesoMax));

    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []) as unknown as PesoConAnimal[];
  },

  /** Estadísticas generales del hato, calculadas desde el peso actual (ya sincronizado) de cada animal. */
  async getGeneralStats(supabase: SupabaseDb, fincaId: string): Promise<PesoGeneralStats> {
    const { data: animalIdsData, error: animalIdsError } = await supabase
      .from("animales")
      .select("id")
      .eq("finca_id", fincaId);
    if (animalIdsError) throw animalIdsError;
    const ids = (animalIdsData ?? []).map((a) => a.id);

    let totalPesajes = 0;
    if (ids.length > 0) {
      const { count, error: countError } = await supabase
        .from("pesos")
        .select("id", { count: "exact", head: true })
        .in("animal_id", ids);
      if (countError) throw countError;
      totalPesajes = count ?? 0;
    }

    const { data: animales, error: animalesError } = await supabase
      .from("animales")
      .select("id, identificador, nombre, peso_actual_kg")
      .eq("finca_id", fincaId)
      .not("peso_actual_kg", "is", null);
    if (animalesError) throw animalesError;

    const conPeso = (animales ?? []) as (PesoAnimalRef & { peso_actual_kg: number })[];

    if (conPeso.length === 0) {
      return {
        totalPesajes: totalPesajes ?? 0,
        pesoPromedioHato: null,
        animalMayorPeso: null,
        animalMenorPeso: null,
      };
    }

    const promedio =
      conPeso.reduce((sum, a) => sum + a.peso_actual_kg, 0) / conPeso.length;

    const mayor = conPeso.reduce((max, a) => (a.peso_actual_kg > max.peso_actual_kg ? a : max));
    const menor = conPeso.reduce((min, a) => (a.peso_actual_kg < min.peso_actual_kg ? a : min));

    return {
      totalPesajes: totalPesajes ?? 0,
      pesoPromedioHato: Number(promedio.toFixed(1)),
      animalMayorPeso: {
        id: mayor.id,
        identificador: mayor.identificador,
        nombre: mayor.nombre,
        peso: mayor.peso_actual_kg,
      },
      animalMenorPeso: {
        id: menor.id,
        identificador: menor.identificador,
        nombre: menor.nombre,
        peso: menor.peso_actual_kg,
      },
    };
  },
};
