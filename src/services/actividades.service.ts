import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database.types";
import type { ActividadConAnimal, EstadoActividad, PrioridadActividad } from "@/features/calendario/types";

type SupabaseDb = SupabaseClient<Database>;
type ActividadInsert = Database["public"]["Tables"]["actividades"]["Insert"];
type ActividadUpdate = Database["public"]["Tables"]["actividades"]["Update"];

const ACTIVIDAD_CON_ANIMAL =
  "*, animal:animales(id, identificador, nombre, sexo, raza:razas(nombre))";

interface AnimalEmbed {
  id: string;
  identificador: string;
  nombre: string | null;
  sexo: "macho" | "hembra";
  raza: { nombre: string } | null;
}

function mapActividad(row: Record<string, unknown>): ActividadConAnimal {
  const animal = row.animal as AnimalEmbed | null;
  return {
    ...(row as unknown as ActividadConAnimal),
    animal: animal
      ? {
          id: animal.id,
          identificador: animal.identificador,
          nombre: animal.nombre,
          sexo: animal.sexo,
          raza: animal.raza?.nombre ?? null,
        }
      : null,
  };
}

export interface ReprogramarPayload {
  fecha: string;
  hora_inicio: string | null;
  hora_fin: string | null;
  prioridad: PrioridadActividad;
}

export const actividadesService = {
  async list(supabase: SupabaseDb, fincaId: string): Promise<ActividadConAnimal[]> {
    const { data, error } = await supabase
      .from("actividades")
      .select(ACTIVIDAD_CON_ANIMAL)
      .eq("finca_id", fincaId)
      .order("fecha", { ascending: false })
      .order("hora_inicio", { ascending: true, nullsFirst: false });

    if (error) throw error;
    return (data ?? []).map((row) => mapActividad(row as unknown as Record<string, unknown>));
  },

  async listByAnimal(supabase: SupabaseDb, animalId: string): Promise<ActividadConAnimal[]> {
    const { data, error } = await supabase
      .from("actividades")
      .select(ACTIVIDAD_CON_ANIMAL)
      .eq("animal_id", animalId)
      .order("fecha", { ascending: false });

    if (error) throw error;
    return (data ?? []).map((row) => mapActividad(row as unknown as Record<string, unknown>));
  },

  async getById(supabase: SupabaseDb, id: string): Promise<ActividadConAnimal | null> {
    const { data, error } = await supabase
      .from("actividades")
      .select(ACTIVIDAD_CON_ANIMAL)
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    return data ? mapActividad(data as unknown as Record<string, unknown>) : null;
  },

  async create(supabase: SupabaseDb, payload: ActividadInsert): Promise<{ id: string }> {
    const { data, error } = await supabase.from("actividades").insert(payload).select("id").single();
    if (error) throw error;
    return { id: data.id };
  },

  async update(supabase: SupabaseDb, id: string, payload: ActividadUpdate): Promise<void> {
    const { error } = await supabase.from("actividades").update(payload).eq("id", id);
    if (error) throw error;
  },

  async cambiarEstado(supabase: SupabaseDb, id: string, estado: EstadoActividad): Promise<void> {
    const { error } = await supabase.from("actividades").update({ estado }).eq("id", id);
    if (error) throw error;
  },

  /** Reprograma una actividad existente (fecha/hora/prioridad) sin crear un registro duplicado. */
  async reprogramar(supabase: SupabaseDb, id: string, payload: ReprogramarPayload): Promise<void> {
    const { error } = await supabase
      .from("actividades")
      .update({ ...payload, estado: "pendiente" })
      .eq("id", id);
    if (error) throw error;
  },
};
