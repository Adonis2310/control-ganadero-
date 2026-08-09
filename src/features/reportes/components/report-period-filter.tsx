"use client";

import { FinancialPeriodFilter } from "@/features/finanzas/components/financial-period-filter";
import type { PeriodoFinanciero, RangoFechas } from "@/features/finanzas/types";

interface ReportPeriodFilterProps {
  periodo: PeriodoFinanciero;
  onPeriodoChange: (periodo: PeriodoFinanciero) => void;
  personalizado: RangoFechas;
  onPersonalizadoChange: (rango: RangoFechas) => void;
}

/**
 * Selector de período global de Reportes. Reutiliza exactamente el filtro y
 * la lógica de rangos de Finanzas (sección 12: no crear una segunda lógica
 * financiera/de períodos diferente).
 */
export function ReportPeriodFilter(props: ReportPeriodFilterProps) {
  return <FinancialPeriodFilter {...props} />;
}
