import { HeartHandshake } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { SexoAnimal } from "@/features/ganado/types";

interface ReproductiveEmptyStateProps {
  sexo: SexoAnimal;
  onRegistrarCelo: () => void;
  onRegistrarMonta: () => void;
  onRegistrarInseminacion: () => void;
}

export function ReproductiveEmptyState({
  sexo,
  onRegistrarCelo,
  onRegistrarMonta,
  onRegistrarInseminacion,
}: ReproductiveEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-16 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-muted">
        <HeartHandshake className="size-5 text-muted-foreground" />
      </div>
      <div className="space-y-1">
        <p className="font-medium">Este animal todavía no tiene registros reproductivos.</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          {sexo === "hembra"
            ? "Registra su primer celo, monta o inseminación para empezar a llevar su control reproductivo."
            : "Registra su primera monta para empezar a llevar su control reproductivo."}
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {sexo === "hembra" && (
          <Button variant="outline" onClick={onRegistrarCelo}>
            + Registrar celo
          </Button>
        )}
        <Button variant="outline" onClick={onRegistrarMonta}>
          + Registrar monta
        </Button>
        {sexo === "hembra" && (
          <Button variant="outline" onClick={onRegistrarInseminacion}>
            + Registrar inseminación
          </Button>
        )}
      </div>
    </div>
  );
}
