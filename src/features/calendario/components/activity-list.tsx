import { CalendarX } from "lucide-react";

import { ActivityCard } from "@/features/calendario/components/activity-card";
import type { CalendarEvent } from "@/features/calendario/types";

interface ActivityListProps {
  eventos: CalendarEvent[];
  emptyMessage: string;
  mostrarFecha?: boolean;
}

export function ActivityList({ eventos, emptyMessage, mostrarFecha }: ActivityListProps) {
  if (eventos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-10 text-center">
        <CalendarX className="size-5 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {eventos.map((evento) => (
        <ActivityCard key={evento.id} evento={evento} mostrarFecha={mostrarFecha} />
      ))}
    </div>
  );
}
