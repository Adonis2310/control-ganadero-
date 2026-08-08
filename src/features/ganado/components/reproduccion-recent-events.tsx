import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { EventoRecienteFinca } from "@/features/ganado/types";
import { formatearFecha } from "@/features/ganado/utils/animal.utils";
import { TIPO_EVENTO_REPRODUCTIVO_LABEL } from "@/features/ganado/types";

export function ReproduccionRecentEvents({ eventos }: { eventos: EventoRecienteFinca[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Eventos recientes</CardTitle>
      </CardHeader>
      <CardContent>
        {eventos.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Todavía no hay eventos reproductivos registrados.
          </p>
        ) : (
          <div className="flex flex-col gap-1">
            {eventos.map((evento, index) => (
              <Link
                key={`${evento.animal.id}-${index}`}
                href={`/ganado/${evento.animal.id}`}
                className="flex items-center justify-between gap-2 rounded-lg px-2 py-2 text-sm transition-colors hover:bg-muted/50"
              >
                <div>
                  <p className="font-medium">
                    {evento.animal.identificador}
                    {evento.animal.nombre ? ` — ${evento.animal.nombre}` : ""}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {TIPO_EVENTO_REPRODUCTIVO_LABEL[evento.tipo]}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">{formatearFecha(evento.fecha)}</span>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
