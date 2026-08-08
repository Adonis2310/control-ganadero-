import type { ClienteStats } from "@/features/clientes/types";
import type { VentaRow } from "@/features/ventas/types";

export function calcularClienteStats(ventas: VentaRow[]): ClienteStats {
  const fechas = ventas.map((v) => v.fecha).sort((a, b) => b.localeCompare(a));

  return {
    totalComprado: ventas.filter((v) => v.estado === "completada").reduce((sum, v) => sum + v.total, 0),
    numeroOperaciones: ventas.length,
    ultimaCompra: fechas[0] ?? null,
  };
}
