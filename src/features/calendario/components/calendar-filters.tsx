"use client";

import { Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ActivityTypeSelect } from "@/features/calendario/components/activity-type-select";
import {
  ESTADO_ACTIVIDAD_OPTIONS,
  PRIORIDAD_ACTIVIDAD_OPTIONS,
  type ActividadFilters,
} from "@/features/calendario/types";
import type { AnimalRef } from "@/features/ganado/types";

interface CalendarFiltersProps {
  filters: ActividadFilters;
  onFiltersChange: (filters: ActividadFilters) => void;
  animales: AnimalRef[];
  hasActiveFilters: boolean;
  onClear: () => void;
}

export function CalendarFilters({ filters, onFiltersChange, animales, hasActiveFilters, onClear }: CalendarFiltersProps) {
  return (
    <div className="flex flex-col gap-3 rounded-xl bg-card p-4 ring-1 ring-foreground/10 backdrop-blur-xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.35)]">
      <div className="relative sm:max-w-sm">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={filters.search}
          onChange={(event) => onFiltersChange({ ...filters, search: event.target.value })}
          placeholder="Buscar por título, descripción o animal..."
          className="pl-8"
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Tipo</label>
          <ActivityTypeSelect
            value={filters.tipo}
            onChange={(value) => onFiltersChange({ ...filters, tipo: (value || "todos") as ActividadFilters["tipo"] })}
            includeTodos
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Estado</label>
          <Select
            value={filters.estado}
            onValueChange={(value) => onFiltersChange({ ...filters, estado: (value ?? "todos") as ActividadFilters["estado"] })}
          >
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue>
                {() => ESTADO_ACTIVIDAD_OPTIONS.find((option) => option.value === filters.estado)?.label ?? "Todos"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              {ESTADO_ACTIVIDAD_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Prioridad</label>
          <Select
            value={filters.prioridad}
            onValueChange={(value) => onFiltersChange({ ...filters, prioridad: (value ?? "todas") as ActividadFilters["prioridad"] })}
          >
            <SelectTrigger className="w-full sm:w-36">
              <SelectValue>
                {() => PRIORIDAD_ACTIVIDAD_OPTIONS.find((option) => option.value === filters.prioridad)?.label ?? "Todas"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas</SelectItem>
              {PRIORIDAD_ACTIVIDAD_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Animal</label>
          <Select
            value={filters.animalId}
            onValueChange={(value) => onFiltersChange({ ...filters, animalId: value || "todos" })}
          >
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue>
                {() => {
                  if (filters.animalId === "todos") return "Todos";
                  const animal = animales.find((a) => a.id === filters.animalId);
                  return animal ? animal.identificador : "Todos";
                }}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              {animales.map((animal) => (
                <SelectItem key={animal.id} value={animal.id}>
                  {animal.identificador}
                  {animal.nombre ? ` — ${animal.nombre}` : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

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
