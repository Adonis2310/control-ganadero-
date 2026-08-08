import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database.types";
import type { ClienteRef, ClienteRow } from "@/features/clientes/types";

type SupabaseDb = SupabaseClient<Database>;
type ClienteInsert = Database["public"]["Tables"]["clientes"]["Insert"];
type ClienteUpdate = Database["public"]["Tables"]["clientes"]["Update"];

export const clientesService = {
  async list(supabase: SupabaseDb): Promise<ClienteRow[]> {
    const { data, error } = await supabase.from("clientes").select("*").order("nombre");
    if (error) throw error;
    return data ?? [];
  },

  /** Clientes activos, para el select de una nueva venta. */
  async listActivos(supabase: SupabaseDb): Promise<ClienteRef[]> {
    const { data, error } = await supabase
      .from("clientes")
      .select("id, nombre, identificacion")
      .eq("activo", true)
      .order("nombre");
    if (error) throw error;
    return data ?? [];
  },

  async getById(supabase: SupabaseDb, id: string): Promise<ClienteRow | null> {
    const { data, error } = await supabase.from("clientes").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return data;
  },

  async create(supabase: SupabaseDb, payload: ClienteInsert): Promise<{ id: string }> {
    const { data, error } = await supabase.from("clientes").insert(payload).select("id").single();
    if (error) throw error;
    return data;
  },

  async update(supabase: SupabaseDb, id: string, payload: ClienteUpdate): Promise<void> {
    const { error } = await supabase.from("clientes").update(payload).eq("id", id);
    if (error) throw error;
  },

  async setActivo(supabase: SupabaseDb, id: string, activo: boolean): Promise<void> {
    const { error } = await supabase.from("clientes").update({ activo }).eq("id", id);
    if (error) throw error;
  },
};
