import Link from "next/link";
import { Eye, MoreVertical, Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AnimalAvatar } from "@/features/ganado/components/animal-avatar";
import { EstadoBadge } from "@/features/ganado/components/estado-badge";
import type { Animal } from "@/features/ganado/types";
import {
  calcularEdad,
  formatearPeso,
  SEXO_LABEL,
} from "@/features/ganado/utils/animal.utils";

interface AnimalMobileListProps {
  animales: Animal[];
  onDeleteRequest: (animal: Animal) => void;
}

export function AnimalMobileList({ animales, onDeleteRequest }: AnimalMobileListProps) {
  return (
    <div className="flex flex-col gap-3 md:hidden">
      {animales.map((animal) => (
        <div
          key={animal.id}
          className="relative rounded-xl border bg-card p-4"
        >
          <Link
            href={`/ganado/${animal.id}`}
            className="flex items-center gap-3 pr-8"
          >
            <AnimalAvatar
              fotoUrl={animal.foto_url}
              nombre={animal.nombre}
              identificador={animal.identificador}
              size="lg"
              className="size-14"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate font-medium">
                  {animal.nombre || animal.identificador}
                </p>
                <EstadoBadge estado={animal.estado} />
              </div>
              <p className="text-sm text-muted-foreground">
                Arete {animal.identificador} · {SEXO_LABEL[animal.sexo]}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {animal.raza?.nombre ?? "Sin raza"} · {calcularEdad(animal.fecha_nacimiento)} ·{" "}
                {formatearPeso(animal.peso_actual_kg)}
              </p>
            </div>
          </Link>

          <div className="absolute top-3 right-3">
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Acciones para ${animal.identificador}`}
                  />
                }
              >
                <MoreVertical className="size-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuGroup>
                  <DropdownMenuItem render={<Link href={`/ganado/${animal.id}`} />}>
                    <Eye />
                    Ver
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    render={<Link href={`/ganado/${animal.id}/editar`} />}
                  >
                    <Pencil />
                    Editar
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => onDeleteRequest(animal)}
                >
                  <Trash2 />
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      ))}
    </div>
  );
}
