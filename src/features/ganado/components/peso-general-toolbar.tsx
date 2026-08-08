"use client";

import { Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { PesoFilters } from "@/features/ganado/types";
import type { PesoOrden } from "@/features/ganado/hooks/use-peso-filters";

const ORDEN_LABEL: Record<PesoOrden, string> = {
  fecha_desc: "Fecha (más reciente)",
  fecha_asc: "Fecha (más antigua)",
  peso_desc: "Peso (mayor)",
  peso_asc: "Peso (menor)",
};

interface PesoGeneralToolbarProps {
  filters: PesoFilters;
  onFiltersChange: (filters: PesoFilters) => void;
  orden: PesoOrden;
  onOrdenChange: (orden: PesoOrden) => void;
  hasActiveFilters: boolean;
  onClear: () => void;
}

export function PesoGeneralToolbar({
  filters,
  onFiltersChange,
  orden,
  onOrdenChange,
  hasActiveFilters,
  onClear,
}: PesoGeneralToolbarProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="relative sm:max-w-sm">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={filters.search}
          onChange={(event) => onFiltersChange({ ...filters, search: event.target.value })}
          placeholder="Buscar por animal o arete..."
          className="pl-8"
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Desde</label>
          <Input
            type="date"
            value={filters.desde}
            onChange={(event) => onFiltersChange({ ...filters, desde: event.target.value })}
            className="w-full sm:w-40"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Hasta</label>
          <Input
            type="date"
            value={filters.hasta}
            onChange={(event) => onFiltersChange({ ...filters, hasta: event.target.value })}
            className="w-full sm:w-40"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Peso mín. (kg)</label>
          <Input
            type="number"
            min={0}
            value={filters.pesoMin}
            onChange={(event) => onFiltersChange({ ...filters, pesoMin: event.target.value })}
            className="w-full sm:w-28"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Peso máx. (kg)</label>
          <Input
            type="number"
            min={0}
            value={filters.pesoMax}
            onChange={(event) => onFiltersChange({ ...filters, pesoMax: event.target.value })}
            className="w-full sm:w-28"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Ordenar por</label>
          <Select value={orden} onValueChange={(value) => onOrdenChange(value as PesoOrden)}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue>{ORDEN_LABEL[orden]}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(ORDEN_LABEL) as PesoOrden[]).map((key) => (
                <SelectItem key={key} value={key}>
                  {ORDEN_LABEL[key]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {hasActiveFilters && (
          <Button variant="ghost" onClick={onClear} className="text-muted-foreground">
            <X className="size-4" />
            Limpiar filtros
          </Button>
        )}
      </div>
    </div>
  );
}
