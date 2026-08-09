import { ActivityList } from "@/features/calendario/components/activity-list";
import type { CalendarEvent } from "@/features/calendario/types";

export function ActivityHistory({ eventos }: { eventos: CalendarEvent[] }) {
  const historial = eventos
    .filter((evento) => evento.origen === "actividad" && (evento.estado === "completada" || evento.estado === "cancelada"))
    .sort((a, b) => b.fecha.localeCompare(a.fecha));

  return (
    <ActivityList eventos={historial} emptyMessage="Todavía no hay actividades completadas o canceladas." mostrarFecha />
  );
}
