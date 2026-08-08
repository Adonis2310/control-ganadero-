import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database.types";
import type { Animal, AnimalRef, CriaRef, SexoAnimal } from "@/features/ganado/types";

type SupabaseDb = SupabaseClient<Database>;
type AnimalInsert = Database["public"]["Tables"]["animales"]["Insert"];
type AnimalUpdate = Database["public"]["Tables"]["animales"]["Update"];

// Solo se embebe `raza` (tabla distinta, sin ambigüedad). PostgREST no
// resuelve de forma confiable el embed de padre/madre para relaciones
// auto-referenciadas: el hint por nombre de constraint no encuentra la
// relación (PGRST200) y el hint por nombre de columna la resuelve en la
// dirección contraria (busca quién me referencia a mí, no a quién yo
// referencio). Padre/madre se resuelven aparte en `attachPadres`.
const ANIMAL_WITH_RAZA = `*, raza:razas(id, nombre)`;

/** Código de Postgres para violación de restricción única. */
export const UNIQUE_VIOLATION_CODE = "23505";

/** Resuelve padre/madre con una consulta separada por id, evitando el embed auto-referenciado. */
async function attachPadres(
  supabase: SupabaseDb,
  rows: Record<string, unknown>[],
): Promise<Animal[]> {
  const parentIds = Array.from(
    new Set(
      rows.flatMap((row) => [row.padre_id, row.madre_id]).filter((id): id is string => Boolean(id)),
    ),
  );

  const parentsById = new Map<string, AnimalRef>();
  if (parentIds.length > 0) {
    const { data, error } = await supabase
      .from("animales")
      .select("id, identificador, nombre")
      .in("id", parentIds);
    if (error) throw error;
    for (const parent of data ?? []) {
      parentsById.set(parent.id, parent);
    }
  }

  return rows.map((row) => ({
    ...row,
    padre: row.padre_id ? (parentsById.get(row.padre_id as string) ?? null) : null,
    madre: row.madre_id ? (parentsById.get(row.madre_id as string) ?? null) : null,
  })) as unknown as Animal[];
}

export const animalesService = {
  async list(supabase: SupabaseDb, fincaId: string): Promise<Animal[]> {
    const { data, error } = await supabase
      .from("animales")
      .select(ANIMAL_WITH_RAZA)
      .eq("finca_id", fincaId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return attachPadres(supabase, (data ?? []) as Record<string, unknown>[]);
  },

  async getById(supabase: SupabaseDb, id: string): Promise<Animal | null> {
    const { data, error } = await supabase
      .from("animales")
      .select(ANIMAL_WITH_RAZA)
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;
    const [animal] = await attachPadres(supabase, [data as Record<string, unknown>]);
    return animal;
  },

  /** Referencia mínima (id/identificador/nombre) de todos los animales de la finca, para selects de filtro. */
  async listAll(supabase: SupabaseDb, fincaId: string): Promise<AnimalRef[]> {
    const { data, error } = await supabase
      .from("animales")
      .select("id, identificador, nombre")
      .eq("finca_id", fincaId)
      .order("identificador");

    if (error) throw error;
    return data ?? [];
  },

  /** Referencia mínima (id/identificador/nombre) de un animal por id, o null si no existe. */
  async getRef(supabase: SupabaseDb, id: string): Promise<AnimalRef | null> {
    const { data, error } = await supabase
      .from("animales")
      .select("id, identificador, nombre")
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  /** Referencia mínima con sexo incluido, para pantallas de reproducción (listado general, filtros). */
  async listAllConSexo(
    supabase: SupabaseDb,
    fincaId: string,
  ): Promise<(AnimalRef & { sexo: SexoAnimal })[]> {
    const { data, error } = await supabase
      .from("animales")
      .select("id, identificador, nombre, sexo")
      .eq("finca_id", fincaId)
      .order("identificador");

    if (error) throw error;
    return data ?? [];
  },

  /** Animales activos de un sexo específico, para selects reproductivos (macho de una monta/inseminación). */
  async listForBreedingSelect(
    supabase: SupabaseDb,
    fincaId: string,
    sexo: SexoAnimal,
  ): Promise<AnimalRef[]> {
    const { data, error } = await supabase
      .from("animales")
      .select("id, identificador, nombre")
      .eq("finca_id", fincaId)
      .eq("sexo", sexo)
      .eq("estado", "activo")
      .order("identificador");

    if (error) throw error;
    return data ?? [];
  },

  /** Crías de un animal (donde es madre o padre), para la pestaña Reproducción. */
  async listDescendientes(supabase: SupabaseDb, animalId: string): Promise<CriaRef[]> {
    const { data, error } = await supabase
      .from("animales")
      .select("id, identificador, nombre, sexo, fecha_nacimiento")
      .or(`madre_id.eq.${animalId},padre_id.eq.${animalId}`)
      .order("fecha_nacimiento", { ascending: false });

    if (error) throw error;
    return data ?? [];
  },

  async listForParentSelect(
    supabase: SupabaseDb,
    fincaId: string,
    sexo: SexoAnimal,
    excludeId?: string,
  ): Promise<AnimalRef[]> {
    let query = supabase
      .from("animales")
      .select("id, identificador, nombre")
      .eq("finca_id", fincaId)
      .eq("sexo", sexo)
      .order("identificador");

    if (excludeId) {
      query = query.neq("id", excludeId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data ?? [];
  },

  async isIdentificadorDisponible(
    supabase: SupabaseDb,
    fincaId: string,
    identificador: string,
    excludeId?: string,
  ): Promise<boolean> {
    let query = supabase
      .from("animales")
      .select("id", { count: "exact", head: true })
      .eq("finca_id", fincaId)
      .eq("identificador", identificador);

    if (excludeId) {
      query = query.neq("id", excludeId);
    }

    const { count, error } = await query;
    if (error) throw error;
    return (count ?? 0) === 0;
  },

  /** Cuántos animales tienen a este como padre o madre (para advertir antes de eliminar). */
  async countDescendientes(supabase: SupabaseDb, id: string): Promise<number> {
    const { count, error } = await supabase
      .from("animales")
      .select("id", { count: "exact", head: true })
      .or(`padre_id.eq.${id},madre_id.eq.${id}`);

    if (error) throw error;
    return count ?? 0;
  },

  async create(supabase: SupabaseDb, payload: AnimalInsert): Promise<{ id: string }> {
    const { data, error } = await supabase
      .from("animales")
      .insert(payload)
      .select("id")
      .single();

    if (error) throw error;
    return data;
  },

  async update(supabase: SupabaseDb, id: string, payload: AnimalUpdate): Promise<void> {
    const { error } = await supabase.from("animales").update(payload).eq("id", id);
    if (error) throw error;
  },

  async remove(supabase: SupabaseDb, id: string): Promise<void> {
    const { error } = await supabase.from("animales").delete().eq("id", id);
    if (error) throw error;
  },
};
