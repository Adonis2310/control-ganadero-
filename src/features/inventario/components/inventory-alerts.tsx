import Link from "next/link";
import { AlertTriangle } from "lucide-react";

import type { InventoryAlert } from "@/features/inventario/types";
import { cn } from "@/lib/utils";

const TONE_CLASS: Record<InventoryAlert["tipo"], string> = {
  stock_bajo:
    "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300",
  agotado:
    "border-red-200 bg-red-50 text-red-800 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300",
};

function mensaje(alerta: InventoryAlert): string {
  return alerta.tipo === "agotado"
    ? `${alerta.producto.nombre} está agotado.`
    : `${alerta.producto.nombre} tiene stock bajo.`;
}

export function InventoryAlerts({ alertas }: { alertas: InventoryAlert[] }) {
  if (alertas.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {alertas.map((alerta) => (
        <Link
          key={`${alerta.tipo}-${alerta.producto.id}`}
          href={`/inventario/${alerta.producto.id}`}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-opacity hover:opacity-80",
            TONE_CLASS[alerta.tipo],
          )}
        >
          <AlertTriangle className="size-3.5" />
          {mensaje(alerta)}
        </Link>
      ))}
    </div>
  );
}
