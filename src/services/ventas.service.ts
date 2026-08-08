import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database, Json } from "@/types/database.types";
import type {
  AnimalVentaInfo,
  DetalleVentaConVenta,
  DetalleVentaRow,
  EstadoVenta,
  LineaVentaInput,
  VentaCompleta,
  VentaConCliente,
} from "@/features/ventas/types";

type SupabaseDb = SupabaseClient<Database>;

const VENTA_CON_CLIENTE = "*, cliente:clientes(id, nombre, identificacion)";
const DETALLE_CON_REFERENCIAS =
  "*, producto:productos_inventario(id, nombre, unidad_medida), animal:animales(id, identificador, nombre)";

function lineasToJson(lineas: LineaVentaInput[]): Json {
  return lineas.map((linea) => ({
    tipo: linea.tipo,
    producto_id: linea.producto_id ?? "",
    animal_id: linea.animal_id ?? "",
    descripcion: linea.descripcion,
    cantidad: linea.cantidad,
    precio_unitario: linea.precio_unitario,
    descuento: linea.descuento,
  })) as unknown as Json;
}

export const ventasService = {
  async list(supabase: SupabaseDb): Promise<VentaConCliente[]> {
    const { data, error } = await supabase
      .from("ventas")
      .select(VENTA_CON_CLIENTE)
      .order("numero", { ascending: false });

    if (error) throw error;
    return (data ?? []) as unknown as VentaConCliente[];
  },

  async listByCliente(supabase: SupabaseDb, clienteId: string): Promise<VentaConCliente[]> {
    const { data, error } = await supabase
      .from("ventas")
      .select(VENTA_CON_CLIENTE)
      .eq("cliente_id", clienteId)
      .order("numero", { ascending: false });

    if (error) throw error;
    return (data ?? []) as unknown as VentaConCliente[];
  },

  /** Todas las líneas de venta (tipo/venta_id únicamente), para calcular estadísticas comerciales. */
  async listAllLineas(supabase: SupabaseDb): Promise<Pick<DetalleVentaRow, "id" | "venta_id" | "tipo">[]> {
    const { data, error } = await supabase.from("detalle_ventas").select("id, venta_id, tipo");
    if (error) throw error;
    return data ?? [];
  },

  /** Historial de ventas de un producto: cada línea con su venta (y cliente) resuelta. */
  async listByProducto(supabase: SupabaseDb, productoId: string): Promise<DetalleVentaConVenta[]> {
    const { data, error } = await supabase
      .from("detalle_ventas")
      .select(`*, venta:ventas(${VENTA_CON_CLIENTE})`)
      .eq("producto_id", productoId);

    if (error) throw error;
    const lineas = (data ?? []) as unknown as DetalleVentaConVenta[];
    return lineas
      .filter((linea) => linea.venta !== null)
      .sort((a, b) => b.venta!.fecha.localeCompare(a.venta!.fecha));
  },

  /** Información de venta de un animal (si fue vendido), para mostrarla en su ficha. */
  async getVentaInfoPorAnimal(supabase: SupabaseDb, animalId: string): Promise<AnimalVentaInfo | null> {
    const { data, error } = await supabase
      .from("detalle_ventas")
      .select(`*, venta:ventas(${VENTA_CON_CLIENTE})`)
      .eq("animal_id", animalId)
      .eq("tipo", "animal");

    if (error) throw error;
    const lineas = (data ?? []) as unknown as AnimalVentaInfo[];
    return lineas.find((linea) => linea.venta?.estado === "completada") ?? null;
  },

  async getById(supabase: SupabaseDb, id: string): Promise<VentaCompleta | null> {
    const { data: venta, error } = await supabase
      .from("ventas")
      .select(VENTA_CON_CLIENTE)
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    if (!venta) return null;

    const { data: lineas, error: lineasError } = await supabase
      .from("detalle_ventas")
      .select(DETALLE_CON_REFERENCIAS)
      .eq("venta_id", id);

    if (lineasError) throw lineasError;

    return {
      ...(venta as unknown as VentaConCliente),
      lineas: (lineas ?? []) as unknown as VentaCompleta["lineas"],
    };
  },

  async crear(
    supabase: SupabaseDb,
    payload: {
      clienteId: string;
      fecha: string;
      estado: EstadoVenta;
      descuento: number;
      impuestos: number;
      metodoPago: string | null;
      observaciones: string | null;
      lineas: LineaVentaInput[];
    },
  ): Promise<{ id: string }> {
    const { data, error } = await supabase.rpc("crear_venta", {
      p_cliente_id: payload.clienteId,
      p_fecha: payload.fecha,
      p_estado: payload.estado,
      p_descuento: payload.descuento,
      p_impuestos: payload.impuestos,
      p_metodo_pago: payload.metodoPago,
      p_observaciones: payload.observaciones,
      p_lineas: lineasToJson(payload.lineas),
    });

    if (error) throw error;
    return { id: data as unknown as string };
  },

  async actualizar(
    supabase: SupabaseDb,
    ventaId: string,
    payload: {
      clienteId: string;
      fecha: string;
      estado: EstadoVenta;
      descuento: number;
      impuestos: number;
      metodoPago: string | null;
      observaciones: string | null;
      lineas: LineaVentaInput[];
    },
  ): Promise<void> {
    const { error } = await supabase.rpc("actualizar_venta", {
      p_venta_id: ventaId,
      p_cliente_id: payload.clienteId,
      p_fecha: payload.fecha,
      p_estado: payload.estado,
      p_descuento: payload.descuento,
      p_impuestos: payload.impuestos,
      p_metodo_pago: payload.metodoPago,
      p_observaciones: payload.observaciones,
      p_lineas: lineasToJson(payload.lineas),
    });

    if (error) throw error;
  },

  /** Valida stock/animales, genera las salidas de inventario y marca animales vendidos, todo de forma atómica. */
  async completar(supabase: SupabaseDb, ventaId: string): Promise<void> {
    const { error } = await supabase.rpc("completar_venta", { p_venta_id: ventaId });
    if (error) throw error;
  },

  /** Revierte una venta completada: devuelve stock, reactiva animales y marca la venta como cancelada. */
  async revertir(supabase: SupabaseDb, ventaId: string): Promise<void> {
    const { error } = await supabase.rpc("revertir_venta", { p_venta_id: ventaId });
    if (error) throw error;
  },

  async cancelar(supabase: SupabaseDb, ventaId: string): Promise<void> {
    const { error } = await supabase.from("ventas").update({ estado: "cancelada" }).eq("id", ventaId);
    if (error) throw error;
  },
};
