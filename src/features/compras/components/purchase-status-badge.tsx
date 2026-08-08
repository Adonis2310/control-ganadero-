import { Badge } from "@/components/ui/badge";
import type { EstadoCompra } from "@/features/compras/types";
import { ESTADO_COMPRA_BADGE_CLASS, ESTADO_COMPRA_LABEL } from "@/features/compras/utils/compra.utils";
import { cn } from "@/lib/utils";

export function PurchaseStatusBadge({ estado }: { estado: EstadoCompra }) {
  return (
    <Badge variant="outline" className={cn("border-transparent font-medium", ESTADO_COMPRA_BADGE_CLASS[estado])}>
      {ESTADO_COMPRA_LABEL[estado]}
    </Badge>
  );
}
