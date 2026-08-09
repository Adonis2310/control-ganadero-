import { ActivityList } from "@/features/calendario/components/activity-list";
import type { CalendarEvent } from "@/features/calendario/types";
import { ordenarPorFechaHora } from "@/features/calendario/utils/actividad.utils";

interface CalendarDayViewProps {
  refDate: string;
  eventos: CalendarEvent[];
}

export function CalendarDayView({ refDate, eventos }: CalendarDayViewProps) {
  const delDia = ordenarPorFechaHora(eventos.filter((evento) => evento.fecha === refDate));

  return <ActivityList eventos={delDia} emptyMessage="No hay actividades programadas para este día." />;
}
