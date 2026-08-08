import type { CompraRow } from "@/features/compras/types";
import type { ProveedorStats } from "@/features/proveedores/types";

export function calcularProveedorStats(compras: CompraRow[]): ProveedorStats {
  const fechas = compras.map((c) => c.fecha).sort((a, b) => b.localeCompare(a));

  return {
    totalComprado: compras.filter((c) => c.estado === "recibida").reduce((sum, c) => sum + c.total, 0),
    numeroCompras: compras.length,
    ultimaCompra: fechas[0] ?? null,
  };
}
