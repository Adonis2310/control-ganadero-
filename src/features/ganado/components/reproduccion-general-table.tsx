import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AnimalReproductivo } from "@/features/ganado/types";
import { TIPO_EVENTO_REPRODUCTIVO_LABEL } from "@/features/ganado/types";
import { formatearFecha } from "@/features/ganado/utils/animal.utils";
import {
  ESTADO_GESTACION_BADGE_CLASS,
  ESTADO_GESTACION_LABEL,
  ESTADO_REPRODUCTIVO_HEMBRA_BADGE_CLASS,
  ESTADO_REPRODUCTIVO_HEMBRA_LABEL,
  ESTADO_REPRODUCTIVO_MACHO_BADGE_CLASS,
  ESTADO_REPRODUCTIVO_MACHO_LABEL,
} from "@/features/ganado/utils/reproduccion.utils";
import { cn } from "@/lib/utils";

function EstadoBadge({ fila }: { fila: AnimalReproductivo }) {
  if (fila.animal.sexo === "hembra") {
    const estado = fila.estado as keyof typeof ESTADO_REPRODUCTIVO_HEMBRA_LABEL;
    return (
      <Badge
        variant="outline"
        className={cn("border-transparent font-medium", ESTADO_REPRODUCTIVO_HEMBRA_BADGE_CLASS[estado])}
      >
        {ESTADO_REPRODUCTIVO_HEMBRA_LABEL[estado]}
      </Badge>
    );
  }
  const estado = fila.estado as keyof typeof ESTADO_REPRODUCTIVO_MACHO_LABEL;
  return (
    <Badge
      variant="outline"
      className={cn("border-transparent font-medium", ESTADO_REPRODUCTIVO_MACHO_BADGE_CLASS[estado])}
    >
      {ESTADO_REPRODUCTIVO_MACHO_LABEL[estado]}
    </Badge>
  );
}

export function ReproduccionGeneralTable({ listado }: { listado: AnimalReproductivo[] }) {
  return (
    <>
      <div className="hidden overflow-hidden rounded-xl border bg-card md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Animal</TableHead>
              <TableHead>Sexo</TableHead>
              <TableHead>Estado reproductivo</TableHead>
              <TableHead>Estado de gestación</TableHead>
              <TableHead>Último evento</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {listado.map((fila) => (
              <TableRow key={fila.animal.id}>
                <TableCell className="font-medium">
                  <Link href={`/ganado/${fila.animal.id}`} className="hover:underline">
                    {fila.animal.identificador}
                    {fila.animal.nombre ? ` — ${fila.animal.nombre}` : ""}
                  </Link>
                </TableCell>
                <TableCell>{fila.animal.sexo === "hembra" ? "Hembra" : "Macho"}</TableCell>
                <TableCell>
                  <EstadoBadge fila={fila} />
                </TableCell>
                <TableCell>
                  {fila.gestacionActual ? (
                    <Badge
                      variant="outline"
                      className={cn(
                        "border-transparent font-medium",
                        ESTADO_GESTACION_BADGE_CLASS[fila.gestacionActual.estado],
                      )}
                    >
                      {ESTADO_GESTACION_LABEL[fila.gestacionActual.estado]}
                    </Badge>
                  ) : (
                    "—"
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {fila.ultimoEvento
                    ? `${TIPO_EVENTO_REPRODUCTIVO_LABEL[fila.ultimoEvento.tipo]} · ${formatearFecha(fila.ultimoEvento.fecha)}`
                    : "Sin registros"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-3 md:hidden">
        {listado.map((fila) => (
          <Link
            key={fila.animal.id}
            href={`/ganado/${fila.animal.id}`}
            className="rounded-xl border bg-card p-4"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-medium">
                  {fila.animal.identificador}
                  {fila.animal.nombre ? ` — ${fila.animal.nombre}` : ""}
                </p>
                <p className="text-xs text-muted-foreground">
                  {fila.animal.sexo === "hembra" ? "Hembra" : "Macho"}
                </p>
              </div>
              <EstadoBadge fila={fila} />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {fila.ultimoEvento
                ? `Último evento: ${TIPO_EVENTO_REPRODUCTIVO_LABEL[fila.ultimoEvento.tipo]} · ${formatearFecha(fila.ultimoEvento.fecha)}`
                : "Sin registros reproductivos"}
            </p>
          </Link>
        ))}
      </div>
    </>
  );
}
