import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ProximoParto } from "@/features/ganado/types";
import { formatearFecha } from "@/features/ganado/utils/animal.utils";

export function ReproduccionUpcomingBirths({ partos }: { partos: ProximoParto[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Próximos partos</CardTitle>
      </CardHeader>
      <CardContent>
        {partos.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No hay partos próximos según las gestaciones confirmadas.
          </p>
        ) : (
          <div className="flex flex-col gap-1">
            {partos.map((parto) => (
              <Link
                key={parto.animal.id}
                href={`/ganado/${parto.animal.id}`}
                className="flex items-center justify-between gap-2 rounded-lg px-2 py-2 text-sm transition-colors hover:bg-muted/50"
              >
                <div>
                  <p className="font-medium">
                    {parto.animal.identificador}
                    {parto.animal.nombre ? ` — ${parto.animal.nombre}` : ""}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Estimado: {formatearFecha(parto.fechaEstimadaParto)}
                  </p>
                </div>
                <span className="text-xs font-medium text-muted-foreground">
                  {parto.diasRestantes === 0
                    ? "Hoy"
                    : parto.diasRestantes > 0
                      ? `En ${parto.diasRestantes} día${parto.diasRestantes === 1 ? "" : "s"}`
                      : `Hace ${Math.abs(parto.diasRestantes)} día${Math.abs(parto.diasRestantes) === 1 ? "" : "s"}`}
                </span>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
