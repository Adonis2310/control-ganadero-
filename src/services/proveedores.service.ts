import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database.types";
import type { ProveedorRef, ProveedorRow } from "@/features/proveedores/types";

type SupabaseDb = SupabaseClient<Database>;
type ProveedorInsert = Database["public"]["Tables"]["proveedores"]["Insert"];
type ProveedorUpdate = Database["public"]["Tables"]["proveedores"]["Update"];

export const proveedoresService = {
  async list(supabase: SupabaseDb): Promise<ProveedorRow[]> {
    const { data, error } = await supabase.from("proveedores").select("*").order("nombre");
    if (error) throw error;
    return data ?? [];
  },

  /** Proveedores activos, para el select de una nueva compra (un proveedor inactivo no debe poder elegirse). */
  async listActivos(supabase: SupabaseDb): Promise<ProveedorRef[]> {
    const { data, error } = await supabase
      .from("proveedores")
      .select("id, nombre, empresa")
      .eq("activo", true)
      .order("nombre");
    if (error) throw error;
    return data ?? [];
  },

  async getById(supabase: SupabaseDb, id: string): Promise<ProveedorRow | null> {
    const { data, error } = await supabase.from("proveedores").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return data;
  },

  async create(supabase: SupabaseDb, payload: ProveedorInsert): Promise<{ id: string }> {
    const { data, error } = await supabase.from("proveedores").insert(payload).select("id").single();
    if (error) throw error;
    return data;
  },

  async update(supabase: SupabaseDb, id: string, payload: ProveedorUpdate): Promise<void> {
    const { error } = await supabase.from("proveedores").update(payload).eq("id", id);
    if (error) throw error;
  },

  async setActivo(supabase: SupabaseDb, id: string, activo: boolean): Promise<void> {
    const { error } = await supabase.from("proveedores").update({ activo }).eq("id", id);
    if (error) throw error;
  },
};
