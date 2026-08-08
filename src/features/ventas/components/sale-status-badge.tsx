import { Badge } from "@/components/ui/badge";
import type { EstadoVenta } from "@/features/ventas/types";
import { ESTADO_VENTA_BADGE_CLASS, ESTADO_VENTA_LABEL } from "@/features/ventas/utils/venta.utils";
import { cn } from "@/lib/utils";

export function SaleStatusBadge({ estado }: { estado: EstadoVenta }) {
  return (
    <Badge variant="outline" className={cn("border-transparent font-medium", ESTADO_VENTA_BADGE_CLASS[estado])}>
      {ESTADO_VENTA_LABEL[estado]}
    </Badge>
  );
}
