"use client";

import { Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { AnimalRef, SaludFilters, TipoRegistroSalud } from "@/features/ganado/types";
import { TIPO_REGISTRO_LABEL } from "@/features/ganado/utils/salud.utils";

const ESTADO_OPTIONS = [
  "Aplicada",
  "Próxima",
  "Vencida",
  "Activa",
  "Recuperado",
  "Activo",
  "Finalizado",
];

interface SaludGeneralToolbarProps {
  filters: SaludFilters;
  onFiltersChange: (filters: SaludFilters) => void;
  estado: string;
  onEstadoChange: (estado: string) => void;
  animales: AnimalRef[];
  hasActiveFilters: boolean;
  onClear: () => void;
}

export function SaludGeneralToolbar({
  filters,
  onFiltersChange,
  estado,
  onEstadoChange,
  animales,
  hasActiveFilters,
  onClear,
}: SaludGeneralToolbarProps) {
  return (
    <div className="flex flex-col gap-3 rounded-xl bg-card p-4 ring-1 ring-foreground/10 backdrop-blur-xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.35)]">
      <div className="relative sm:max-w-sm">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={filters.search}
          onChange={(event) => onFiltersChange({ ...filters, search: event.target.value })}
          placeholder="Buscar por nombre, arete o registro..."
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
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue>
                {() => {
                  if (filters.animalId === "todos") return "Todos los animales";
                  const animal = animales.find((a) => a.id === filters.animalId);
                  if (!animal) return "Todos los animales";
                  return animal.nombre ? `${animal.identificador} — ${animal.nombre}` : animal.identificador;
                }}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los animales</SelectItem>
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
          <label className="text-xs font-medium text-muted-foreground">Tipo de registro</label>
          <Select
            value={filters.tipo}
            onValueChange={(next) =>
              onFiltersChange({ ...filters, tipo: (next ?? "todos") as TipoRegistroSalud | "todos" })
            }
          >
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue>
                {() => (filters.tipo === "todos" ? "Todos" : TIPO_REGISTRO_LABEL[filters.tipo])}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              {(Object.keys(TIPO_REGISTRO_LABEL) as TipoRegistroSalud[]).map((tipo) => (
                <SelectItem key={tipo} value={tipo}>
                  {TIPO_REGISTRO_LABEL[tipo]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Estado</label>
          <Select value={estado} onValueChange={(next) => onEstadoChange(next ?? "todos")}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue>{() => (estado === "todos" ? "Todos" : estado)}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              {ESTADO_OPTIONS.map((opcion) => (
                <SelectItem key={opcion} value={opcion}>
                  {opcion}
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
