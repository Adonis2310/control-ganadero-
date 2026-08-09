import Link from "next/link";
import { CalendarDays } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ActivityPriorityBadge } from "@/features/calendario/components/activity-priority-badge";
import type { ActividadStats, CalendarEvent } from "@/features/calendario/types";
import { formatearFechaActividad, formatearHora } from "@/features/calendario/utils/actividad.utils";

interface AgendaDashboardWidgetProps {
  stats: ActividadStats;
  proxima: CalendarEvent | null;
}

export function AgendaDashboardWidget({ stats, proxima }: AgendaDashboardWidgetProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
        <div>
          <CardTitle>Agenda</CardTitle>
          <CardDescription>Actividades programadas en el calendario</CardDescription>
        </div>
        <Button variant="ghost" size="sm" nativeButton={false} render={<Link href="/calendario" />}>
          Ver calendario
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-2 text-center">
          <div>
            <p className="text-lg font-semibold">{stats.hoy}</p>
            <p className="text-xs text-muted-foreground">Actividades hoy</p>
          </div>
          <div>
            <p className="text-lg font-semibold">{stats.vencidas}</p>
            <p className="text-xs text-muted-foreground">Vencidas</p>
          </div>
        </div>

        <div className="border-t pt-3">
          <p className="mb-1.5 text-xs font-medium text-muted-foreground">Próxima actividad</p>
          {proxima ? (
            <Link
              href={proxima.href ?? "/calendario"}
              className="flex items-center justify-between gap-2 rounded-lg border p-2.5 text-sm hover:bg-muted/50"
            >
              <div className="min-w-0">
                <p className="truncate font-medium">{proxima.titulo}</p>
                <p className="text-xs text-muted-foreground">
                  {formatearFechaActividad(proxima.fecha)}
                  {formatearHora(proxima.horaInicio) ? ` · ${formatearHora(proxima.horaInicio)}` : ""}
                </p>
              </div>
              <ActivityPriorityBadge prioridad={proxima.prioridad} />
            </Link>
          ) : (
            <div className="flex items-center gap-2 rounded-lg border border-dashed p-2.5 text-sm text-muted-foreground">
              <CalendarDays className="size-4" />
              Calendario vacío
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
