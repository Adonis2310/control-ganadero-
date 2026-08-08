import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database.types";
import type { GastoConReferencias } from "@/features/finanzas/types";

type SupabaseDb = SupabaseClient<Database>;

const GASTO_CON_REFERENCIAS =
  "*, categoria:categorias_gastos(id, nombre), proveedor:proveedores(id, nombre, empresa), animal:animales(id, identificador, nombre)";

export interface GastoPayload {
  categoria_id: string;
  descripcion: string;
  monto: number;
  fecha: string;
  metodo_pago: string | null;
  proveedor_id: string | null;
  animal_id: string | null;
  observaciones: string | null;
}

export const gastosService = {
  async list(supabase: SupabaseDb): Promise<GastoConReferencias[]> {
    const { data, error } = await supabase
      .from("gastos")
      .select(GASTO_CON_REFERENCIAS)
      .order("fecha", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data ?? []) as unknown as GastoConReferencias[];
  },

  async listByAnimal(supabase: SupabaseDb, animalId: string): Promise<GastoConReferencias[]> {
    const { data, error } = await supabase
      .from("gastos")
      .select(GASTO_CON_REFERENCIAS)
      .eq("animal_id", animalId)
      .order("fecha", { ascending: false });

    if (error) throw error;
    return (data ?? []) as unknown as GastoConReferencias[];
  },

  async listByProveedor(supabase: SupabaseDb, proveedorId: string): Promise<GastoConReferencias[]> {
    const { data, error } = await supabase
      .from("gastos")
      .select(GASTO_CON_REFERENCIAS)
      .eq("proveedor_id", proveedorId)
      .order("fecha", { ascending: false });

    if (error) throw error;
    return (data ?? []) as unknown as GastoConReferencias[];
  },

  async getById(supabase: SupabaseDb, id: string): Promise<GastoConReferencias | null> {
    const { data, error } = await supabase
      .from("gastos")
      .select(GASTO_CON_REFERENCIAS)
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    return data as unknown as GastoConReferencias | null;
  },

  async create(supabase: SupabaseDb, payload: GastoPayload): Promise<{ id: string }> {
    const { data, error } = await supabase.from("gastos").insert(payload).select("id").single();
    if (error) throw error;
    return { id: data.id };
  },

  async update(supabase: SupabaseDb, id: string, payload: GastoPayload): Promise<void> {
    const { error } = await supabase.from("gastos").update(payload).eq("id", id);
    if (error) throw error;
  },

  async remove(supabase: SupabaseDb, id: string): Promise<void> {
    const { error } = await supabase.from("gastos").delete().eq("id", id);
    if (error) throw error;
  },
};
