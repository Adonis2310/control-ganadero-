import { Badge } from "@/components/ui/badge";
import { AnimalAvatar } from "@/features/ganado/components/animal-avatar";
import { AnimalDetailActions } from "@/features/ganado/components/animal-detail-actions";
import { EstadoBadge } from "@/features/ganado/components/estado-badge";
import type { Animal } from "@/features/ganado/types";
import { SEXO_LABEL } from "@/features/ganado/utils/animal.utils";

export function AnimalDetailHeader({ animal }: { animal: Animal }) {
  return (
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div className="flex items-center gap-4">
        <AnimalAvatar
          fotoUrl={animal.foto_url}
          nombre={animal.nombre}
          identificador={animal.identificador}
          size="lg"
        />
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              {animal.nombre || animal.identificador}
            </h1>
            <EstadoBadge estado={animal.estado} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Arete {animal.identificador}
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <Badge variant="outline">{animal.raza?.nombre ?? "Sin raza"}</Badge>
            <Badge variant="outline">{SEXO_LABEL[animal.sexo]}</Badge>
          </div>
        </div>
      </div>

      <AnimalDetailActions animal={animal} />
    </div>
  );
}
