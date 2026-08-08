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
import {
  ESTADO_OPTIONS,
  SEXO_OPTIONS,
  type AnimalFilters,
  type Raza,
} from "@/features/ganado/types";

interface AnimalToolbarProps {
  filters: AnimalFilters;
  onFiltersChange: (filters: AnimalFilters) => void;
  razas: Raza[];
  hasActiveFilters: boolean;
  onClear: () => void;
}

export function AnimalToolbar({
  filters,
  onFiltersChange,
  razas,
  hasActiveFilters,
  onClear,
}: AnimalToolbarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
      <div className="relative flex-1 sm:min-w-56">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={filters.search}
          onChange={(event) =>
            onFiltersChange({ ...filters, search: event.target.value })
          }
          placeholder="Buscar por arete o nombre..."
          className="pl-8"
        />
      </div>

      <Select
        value={filters.sexo}
        onValueChange={(value) =>
          onFiltersChange({ ...filters, sexo: value as AnimalFilters["sexo"] })
        }
      >
        <SelectTrigger className="w-full sm:w-40">
          <SelectValue placeholder="Sexo">
            {(current: string | null) =>
              SEXO_OPTIONS.find((option) => option.value === current)?.label ??
              "Todos los sexos"
            }
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">Todos los sexos</SelectItem>
          {SEXO_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.razaId}
        onValueChange={(value) =>
          onFiltersChange({ ...filters, razaId: value ?? "todos" })
        }
      >
        <SelectTrigger className="w-full sm:w-44">
          <SelectValue placeholder="Raza">
            {(current: string | null) =>
              razas.find((raza) => raza.id === current)?.nombre ?? "Todas las razas"
            }
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">Todas las razas</SelectItem>
          {razas.map((raza) => (
            <SelectItem key={raza.id} value={raza.id}>
              {raza.nombre}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.estado}
        onValueChange={(value) =>
          onFiltersChange({ ...filters, estado: value as AnimalFilters["estado"] })
        }
      >
        <SelectTrigger className="w-full sm:w-40">
          <SelectValue placeholder="Estado">
            {(current: string | null) =>
              ESTADO_OPTIONS.find((option) => option.value === current)?.label ??
              "Todos los estados"
            }
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">Todos los estados</SelectItem>
          {ESTADO_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasActiveFilters && (
        <Button variant="ghost" onClick={onClear} className="text-muted-foreground">
          <X className="size-4" />
          Limpiar filtros
        </Button>
      )}
    </div>
  );
}
