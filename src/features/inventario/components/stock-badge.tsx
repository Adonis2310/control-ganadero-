import { Badge } from "@/components/ui/badge";
import type { EstadoStock } from "@/features/inventario/types";
import { ESTADO_STOCK_BADGE_CLASS, ESTADO_STOCK_LABEL } from "@/features/inventario/utils/inventario.utils";
import { cn } from "@/lib/utils";

export function StockBadge({ estado }: { estado: EstadoStock }) {
  return (
    <Badge variant="outline" className={cn("border-transparent font-medium", ESTADO_STOCK_BADGE_CLASS[estado])}>
      {ESTADO_STOCK_LABEL[estado]}
    </Badge>
  );
}
