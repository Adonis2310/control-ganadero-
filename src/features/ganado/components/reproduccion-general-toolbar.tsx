"use client";

import { Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { AnimalRef, EstadoGestacion, ReproduccionFilters, SexoAnimal } from "@/features/ganado/types";
import { ESTADO_GESTACION_OPTIONS } from "@/features/ganado/types";
import {
  ESTADO_REPRODUCTIVO_HEMBRA_LABEL,
  ESTADO_REPRODUCTIVO_MACHO_LABEL,
} from "@/features/ganado/utils/reproduccion.utils";

const ESTADO_REPRODUCTIVO_OPTIONS: { value: string; label: string }[] = [
  ...Object.entries(ESTADO_REPRODUCTIVO_HEMBRA_LABEL).map(([value, label]) => ({ value, label })),
  { value: "activo", label: ESTADO_REPRODUCTIVO_MACHO_LABEL.activo },
];

interface ReproduccionGeneralToolbarProps {
  filters: ReproduccionFilters;
  onFiltersChange: (filters: ReproduccionFilters) => void;
  animales: AnimalRef[];
  hasActiveFilters: boolean;
  onClear: () => void;
}

export function ReproduccionGeneralToolbar({
  filters,
  onFiltersChange,
  animales,
  hasActiveFilters,
  onClear,
}: ReproduccionGeneralToolbarProps) {
  return (
    <div className="flex flex-col gap-3 rounded-xl bg-card p-4 ring-1 ring-foreground/10 backdrop-blur-xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.35)]">
      <div className="relative sm:max-w-sm">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={filters.search}
          onChange={(event) => onFiltersChange({ ...filters, search: event.target.value })}
          placeholder="Buscar por nombre o arete..."
          className="pl-8"
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Animal</label>
          <Select
            value={filters.animalId}
            onValueChange={(next) => onFiltersChange({ ...filters, animalId: next ?? "todos" })}
          >
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue>
                {() => {
                  if (filters.animalId === "todos") return "Todos";
                  const animal = animales.find((a) => a.id === filters.animalId);
                  if (!animal) return "Todos";
                  return animal.nombre ? `${animal.identificador} — ${animal.nombre}` : animal.identificador;
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
          <label className="text-xs font-medium text-muted-foreground">Sexo</label>
          <Select
            value={filters.sexo}
            onValueChange={(next) =>
              onFiltersChange({ ...filters, sexo: (next ?? "todos") as SexoAnimal | "todos" })
            }
          >
            <SelectTrigger className="w-full sm:w-32">
              <SelectValue>
                {() => (filters.sexo === "todos" ? "Todos" : filters.sexo === "hembra" ? "Hembra" : "Macho")}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="hembra">Hembra</SelectItem>
              <SelectItem value="macho">Macho</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Estado reproductivo</label>
          <Select
            value={filters.estadoReproductivo}
            onValueChange={(next) =>
              onFiltersChange({
                ...filters,
                estadoReproductivo: (next ?? "todos") as ReproduccionFilters["estadoReproductivo"],
              })
            }
          >
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue>
                {() =>
                  filters.estadoReproductivo === "todos"
                    ? "Todos"
                    : (ESTADO_REPRODUCTIVO_OPTIONS.find((o) => o.value === filters.estadoReproductivo)
                        ?.label ?? "Todos")
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              {ESTADO_REPRODUCTIVO_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Estado de gestación</label>
          <Select
            value={filters.estadoGestacion}
            onValueChange={(next) =>
              onFiltersChange({
                ...filters,
                estadoGestacion: (next ?? "todos") as EstadoGestacion | "todos",
              })
            }
          >
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue>
                {() =>
                  filters.estadoGestacion === "todos"
                    ? "Todos"
                    : (ESTADO_GESTACION_OPTIONS.find((o) => o.value === filters.estadoGestacion)?.label ??
                      "Todos")
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              {ESTADO_GESTACION_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
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
