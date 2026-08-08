"use client";

import { useMemo, useState } from "react";

import type { PeriodoFinanciero, RangoFechas } from "@/features/finanzas/types";
import { calcularPeriodoAnterior, calcularRangoPeriodo } from "@/features/finanzas/utils/periodo.utils";

export function useFinancialPeriod() {
  const [periodo, setPeriodo] = useState<PeriodoFinanciero>("mes");
  const [personalizado, setPersonalizado] = useState<RangoFechas>({ desde: "", hasta: "" });

  const rango = useMemo(() => {
    if (periodo === "personalizado" && (!personalizado.desde || !personalizado.hasta)) {
      return calcularRangoPeriodo("mes");
    }
    return calcularRangoPeriodo(periodo, personalizado);
  }, [periodo, personalizado]);

  const rangoAnterior = useMemo(() => calcularPeriodoAnterior(rango), [rango]);

  return { periodo, setPeriodo, personalizado, setPersonalizado, rango, rangoAnterior };
}
