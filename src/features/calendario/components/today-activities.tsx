import { ActivityList } from "@/features/calendario/components/activity-list";
import type { CalendarEvent } from "@/features/calendario/types";
import { esHoy } from "@/features/calendario/utils/actividad.utils";

export function TodayActivities({ eventos }: { eventos: CalendarEvent[] }) {
  const deHoy = eventos.filter((evento) => esHoy(evento.fecha) && evento.estado !== "cancelada");

  return <ActivityList eventos={deHoy} emptyMessage="No tienes actividades programadas para hoy." />;
}
