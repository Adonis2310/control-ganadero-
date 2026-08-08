import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database, Json } from "@/types/database.types";
import type {
  CompraCompleta,
  CompraConProveedor,
  DetalleCompraConCompra,
  EstadoCompra,
  LineaCompraInput,
} from "@/features/compras/types";

type SupabaseDb = SupabaseClient<Database>;

const COMPRA_CON_PROVEEDOR = "*, proveedor:proveedores(id, nombre, empresa)";
const DETALLE_CON_PRODUCTO = "*, producto:productos_inventario(id, nombre, unidad_medida)";

function lineasToJson(lineas: LineaCompraInput[]): Json {
  return lineas.map((linea) => ({
    producto_id: linea.producto_id,
    cantidad: linea.cantidad,
    costo_unitario: linea.costo_unitario,
    descuento: linea.descuento,
  })) as unknown as Json;
}

export const comprasService = {
  async list(supabase: SupabaseDb): Promise<CompraConProveedor[]> {
    const { data, error } = await supabase
      .from("compras")
      .select(COMPRA_CON_PROVEEDOR)
      .order("numero", { ascending: false });

    if (error) throw error;
    return (data ?? []) as unknown as CompraConProveedor[];
  },

  async listByProveedor(supabase: SupabaseDb, proveedorId: string): Promise<CompraConProveedor[]> {
    const { data, error } = await supabase
      .from("compras")
      .select(COMPRA_CON_PROVEEDOR)
      .eq("proveedor_id", proveedorId)
      .order("numero", { ascending: false });

    if (error) throw error;
    return (data ?? []) as unknown as CompraConProveedor[];
  },

  /** Historial de compras de un producto: cada línea con su compra (y proveedor) resuelta. */
  async listByProducto(supabase: SupabaseDb, productoId: string): Promise<DetalleCompraConCompra[]> {
    const { data, error } = await supabase
      .from("detalle_compras")
      .select(`*, compra:compras(${COMPRA_CON_PROVEEDOR})`)
      .eq("producto_id", productoId);

    if (error) throw error;
    const lineas = (data ?? []) as unknown as DetalleCompraConCompra[];
    return lineas
      .filter((linea) => linea.compra !== null)
      .sort((a, b) => (b.compra!.fecha).localeCompare(a.compra!.fecha));
  },

  async getById(supabase: SupabaseDb, id: string): Promise<CompraCompleta | null> {
    const { data: compra, error } = await supabase
      .from("compras")
      .select(COMPRA_CON_PROVEEDOR)
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    if (!compra) return null;

    const { data: lineas, error: lineasError } = await supabase
      .from("detalle_compras")
      .select(DETALLE_CON_PRODUCTO)
      .eq("compra_id", id);

    if (lineasError) throw lineasError;

    return {
      ...(compra as unknown as CompraConProveedor),
      lineas: (lineas ?? []) as unknown as CompraCompleta["lineas"],
    };
  },

  async crear(
    supabase: SupabaseDb,
    payload: {
      proveedorId: string;
      fecha: string;
      estado: EstadoCompra;
      descuento: number;
      impuestos: number;
      observaciones: string | null;
      lineas: LineaCompraInput[];
    },
  ): Promise<{ id: string }> {
    const { data, error } = await supabase.rpc("crear_compra", {
      p_proveedor_id: payload.proveedorId,
      p_fecha: payload.fecha,
      p_estado: payload.estado,
      p_descuento: payload.descuento,
      p_impuestos: payload.impuestos,
      p_observaciones: payload.observaciones,
      p_lineas: lineasToJson(payload.lineas),
    });

    if (error) throw error;
    return { id: data as unknown as string };
  },

  async actualizar(
    supabase: SupabaseDb,
    compraId: string,
    payload: {
      proveedorId: string;
      fecha: string;
      estado: EstadoCompra;
      descuento: number;
      impuestos: number;
      observaciones: string | null;
      lineas: LineaCompraInput[];
    },
  ): Promise<void> {
    const { error } = await supabase.rpc("actualizar_compra", {
      p_compra_id: compraId,
      p_proveedor_id: payload.proveedorId,
      p_fecha: payload.fecha,
      p_estado: payload.estado,
      p_descuento: payload.descuento,
      p_impuestos: payload.impuestos,
      p_observaciones: payload.observaciones,
      p_lineas: lineasToJson(payload.lineas),
    });

    if (error) throw error;
  },

  /** Genera las entradas de inventario de cada línea y marca la compra como recibida, de forma atómica. */
  async recibir(supabase: SupabaseDb, compraId: string): Promise<void> {
    const { error } = await supabase.rpc("recibir_compra", { p_compra_id: compraId });
    if (error) throw error;
  },

  async marcarPendiente(supabase: SupabaseDb, compraId: string): Promise<void> {
    const { error } = await supabase.from("compras").update({ estado: "pendiente" }).eq("id", compraId);
    if (error) throw error;
  },

  async cancelar(supabase: SupabaseDb, compraId: string): Promise<void> {
    const { error } = await supabase.from("compras").update({ estado: "cancelada" }).eq("id", compraId);
    if (error) throw error;
  },
};
