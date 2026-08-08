"use client";

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PERIODO_OPTIONS, type PeriodoFinanciero, type RangoFechas } from "@/features/finanzas/types";

interface FinancialPeriodFilterProps {
  periodo: PeriodoFinanciero;
  onPeriodoChange: (periodo: PeriodoFinanciero) => void;
  personalizado: RangoFechas;
  onPersonalizadoChange: (rango: RangoFechas) => void;
}

export function FinancialPeriodFilter({
  periodo,
  onPeriodoChange,
  personalizado,
  onPersonalizadoChange,
}: FinancialPeriodFilterProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">Período</label>
        <Select
          value={periodo}
          onValueChange={(next) => onPeriodoChange((next ?? "mes") as PeriodoFinanciero)}
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue>
              {() => PERIODO_OPTIONS.find((option) => option.value === periodo)?.label ?? "Este mes"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {PERIODO_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {periodo === "personalizado" && (
        <>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Desde</label>
            <Input
              type="date"
              value={personalizado.desde}
              onChange={(event) => onPersonalizadoChange({ ...personalizado, desde: event.target.value })}
              className="w-full sm:w-40"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Hasta</label>
            <Input
              type="date"
              value={personalizado.hasta}
              onChange={(event) => onPersonalizadoChange({ ...personalizado, hasta: event.target.value })}
              className="w-full sm:w-40"
            />
          </div>
        </>
      )}
    </div>
  );
}
