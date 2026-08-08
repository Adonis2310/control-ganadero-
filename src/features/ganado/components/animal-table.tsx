import Link from "next/link";
import { Eye, MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AnimalAvatar } from "@/features/ganado/components/animal-avatar";
import { EstadoBadge } from "@/features/ganado/components/estado-badge";
import type { Animal } from "@/features/ganado/types";
import {
  calcularEdad,
  formatearFecha,
  formatearPeso,
  SEXO_LABEL,
} from "@/features/ganado/utils/animal.utils";

interface AnimalTableProps {
  animales: Animal[];
  onDeleteRequest: (animal: Animal) => void;
}

export function AnimalTable({ animales, onDeleteRequest }: AnimalTableProps) {
  return (
    <div className="hidden overflow-hidden rounded-xl border bg-card md:block">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12"></TableHead>
            <TableHead>Arete</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead>Sexo</TableHead>
            <TableHead>Raza</TableHead>
            <TableHead>Nacimiento</TableHead>
            <TableHead>Edad</TableHead>
            <TableHead>Peso</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="w-12 text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {animales.map((animal) => (
            <TableRow key={animal.id}>
              <TableCell>
                <AnimalAvatar
                  fotoUrl={animal.foto_url}
                  nombre={animal.nombre}
                  identificador={animal.identificador}
                  size="sm"
                />
              </TableCell>
              <TableCell className="font-medium">
                <Link
                  href={`/ganado/${animal.id}`}
                  className="hover:underline"
                >
                  {animal.identificador}
                </Link>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {animal.nombre || "—"}
              </TableCell>
              <TableCell>{SEXO_LABEL[animal.sexo]}</TableCell>
              <TableCell className="text-muted-foreground">
                {animal.raza?.nombre ?? "Sin raza"}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatearFecha(animal.fecha_nacimiento)}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {calcularEdad(animal.fecha_nacimiento)}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatearPeso(animal.peso_actual_kg)}
              </TableCell>
              <TableCell>
                <EstadoBadge estado={animal.estado} />
              </TableCell>
              <TableCell className="text-right">
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
                    <MoreHorizontal className="size-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuGroup>
                      <DropdownMenuItem
                        render={<Link href={`/ganado/${animal.id}`} />}
                      >
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
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
