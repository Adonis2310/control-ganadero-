import Link from "next/link";
import { Beef, SearchX } from "lucide-react";

import { Button } from "@/components/ui/button";

interface AnimalEmptyStateProps {
  variant: "sin-animales" | "sin-resultados";
  onClearFilters?: () => void;
}

export function AnimalEmptyState({ variant, onClearFilters }: AnimalEmptyStateProps) {
  if (variant === "sin-resultados") {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-16 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-muted">
          <SearchX className="size-5 text-muted-foreground" />
        </div>
        <div className="space-y-1">
          <p className="font-medium">Ningún animal coincide con la búsqueda</p>
          <p className="text-sm text-muted-foreground">
            Prueba ajustando los filtros o el término de búsqueda.
          </p>
        </div>
        {onClearFilters && (
          <Button variant="outline" onClick={onClearFilters}>
            Limpiar filtros
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-20 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-muted">
        <Beef className="size-6 text-muted-foreground" />
      </div>
      <div className="space-y-1">
        <p className="font-medium">
          Tu finca todavía no tiene animales registrados.
        </p>
        <p className="max-w-sm text-sm text-muted-foreground">
          Registra tu primer animal para empezar a llevar el control de tu
          hato.
        </p>
      </div>
      <Button nativeButton={false} render={<Link href="/ganado/nuevo" />}>
        + Agregar primer animal
      </Button>
    </div>
  );
}
