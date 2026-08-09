"use client";

import { CalendarDayView } from "@/features/calendario/components/calendar-day-view";
import { CalendarHeader } from "@/features/calendario/components/calendar-header";
import { CalendarMonthGrid } from "@/features/calendario/components/calendar-month-grid";
import { CalendarWeekView } from "@/features/calendario/components/calendar-week-view";
import { useCalendarNavigation } from "@/features/calendario/hooks/use-calendar-navigation";
import type { CalendarEvent } from "@/features/calendario/types";

interface CalendarViewProps {
  eventos: CalendarEvent[];
}

export function CalendarView({ eventos }: CalendarViewProps) {
  const { viewMode, setViewMode, refDate, setRefDate, goToday, goPrevious, goNext } = useCalendarNavigation();

  function handleSelectDay(fecha: string) {
    setRefDate(fecha);
    setViewMode("dia");
  }

  return (
    <div className="flex flex-col gap-4">
      <CalendarHeader
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        refDate={refDate}
        onPrevious={goPrevious}
        onNext={goNext}
        onToday={goToday}
      />

      {viewMode === "mes" && <CalendarMonthGrid refDate={refDate} eventos={eventos} onSelectDay={handleSelectDay} />}
      {viewMode === "semana" && <CalendarWeekView refDate={refDate} eventos={eventos} onSelectDay={handleSelectDay} />}
      {viewMode === "dia" && <CalendarDayView refDate={refDate} eventos={eventos} />}
    </div>
  );
}
