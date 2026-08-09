"use client";

import { useState } from "react";

import { hoyISO, sumarDias, sumarMeses } from "@/features/calendario/utils/actividad.utils";
import type { CalendarViewMode } from "@/features/calendario/types";

export function useCalendarNavigation() {
  const [viewMode, setViewMode] = useState<CalendarViewMode>("mes");
  const [refDate, setRefDate] = useState(hoyISO());

  function goToday() {
    setRefDate(hoyISO());
  }

  function goPrevious() {
    if (viewMode === "mes") setRefDate((current) => sumarMeses(current, -1));
    else if (viewMode === "semana") setRefDate((current) => sumarDias(current, -7));
    else setRefDate((current) => sumarDias(current, -1));
  }

  function goNext() {
    if (viewMode === "mes") setRefDate((current) => sumarMeses(current, 1));
    else if (viewMode === "semana") setRefDate((current) => sumarDias(current, 7));
    else setRefDate((current) => sumarDias(current, 1));
  }

  return { viewMode, setViewMode, refDate, setRefDate, goToday, goPrevious, goNext };
}
