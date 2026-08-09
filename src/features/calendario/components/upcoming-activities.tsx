import { ActivityList } from "@/features/calendario/components/activity-list";
import type { CalendarEvent } from "@/features/calendario/types";
import { estaEnProximosDias } from "@/features/calendario/utils/actividad.utils";

const DIAS_PROXIMOS = 7;

export function UpcomingActivities({ eventos }: { eventos: CalendarEvent[] }) {
  const proximas = eventos.filter(
    (evento) => estaEnProximosDias(evento.fecha, DIAS_PROXIMOS) && evento.estado !== "cancelada",
  );

  return (
    <ActivityList
      eventos={proximas}
      emptyMessage={`No hay actividades programadas para los próximos ${DIAS_PROXIMOS} días.`}
      mostrarFecha
    />
  );
}
