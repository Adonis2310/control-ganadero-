import Link from "next/link";

import type { PesoConAnimal } from "@/features/ganado/types";
import { formatearFecha, formatearPeso } from "@/features/ganado/utils/animal.utils";
import { formatearPorcentaje, formatearVariacion } from "@/features/ganado/utils/peso.utils";

type PesoFila = PesoConAnimal & { variacionKg: number | null; variacionPorcentaje: number | null };

export function PesoGeneralMobile({ pesos }: { pesos: PesoFila[] }) {
  return (
    <div className="flex flex-col gap-3 md:hidden">
      {pesos.map((peso) => (
        <div key={peso.id} className="rounded-xl border bg-card p-4">
          <div className="flex items-start justify-between">
            <div>
              {peso.animal ? (
                <Link href={`/ganado/${peso.animal.id}`} className="font-medium hover:underline">
                  {peso.animal.nombre || peso.animal.identificador}
                </Link>
              ) : (
                <p className="font-medium">—</p>
              )}
              <p className="text-xs text-muted-foreground">
                Arete {peso.animal?.identificador ?? "—"} · {formatearFecha(peso.fecha)}
              </p>
            </div>
            <p className="text-lg font-semibold">{formatearPeso(peso.peso)}</p>
          </div>
          {peso.variacionKg !== null && (
            <p
              className={
                "mt-2 text-sm " +
                (peso.variacionKg >= 0
                  ? "text-emerald-600 dark:text-emerald-500"
                  : "text-red-600 dark:text-red-500")
              }
            >
              {formatearVariacion(peso.variacionKg)} ({formatearPorcentaje(peso.variacionPorcentaje)})
            </p>
          )}
          {peso.observaciones && (
            <p className="mt-2 text-sm text-muted-foreground">{peso.observaciones}</p>
          )}
        </div>
      ))}
    </div>
  );
}
