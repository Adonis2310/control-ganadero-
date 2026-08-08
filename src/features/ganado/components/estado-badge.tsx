import { Badge } from "@/components/ui/badge";
import type { EstadoAnimal } from "@/features/ganado/types";
import { ESTADO_BADGE_CLASS, ESTADO_LABEL } from "@/features/ganado/utils/animal.utils";
import { cn } from "@/lib/utils";

export function EstadoBadge({ estado }: { estado: EstadoAnimal }) {
  return (
    <Badge variant="outline" className={cn("border-transparent font-medium", ESTADO_BADGE_CLASS[estado])}>
      {ESTADO_LABEL[estado]}
    </Badge>
  );
}
