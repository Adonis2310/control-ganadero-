"use client";

import { Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TIPO_PROVEEDOR_OPTIONS, type ProveedorFilters } from "@/features/proveedores/types";

interface SupplierToolbarProps {
  filters: ProveedorFilters;
  onFiltersChange: (filters: ProveedorFilters) => void;
  hasActiveFilters: boolean;
  onClear: () => void;
}

export function SupplierToolbar({ filters, onFiltersChange, hasActiveFilters, onClear }: SupplierToolbarProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="relative sm:max-w-sm">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={filters.search}
          onChange={(event) => onFiltersChange({ ...filters, search: event.target.value })}
          placeholder="Buscar por nombre, empresa o teléfono..."
          className="pl-8"
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Tipo</label>
          <Select value={filters.tipo} onValueChange={(next) => onFiltersChange({ ...filters, tipo: next ?? "todos" })}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue>{() => (filters.tipo === "todos" ? "Todos" : filters.tipo)}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              {TIPO_PROVEEDOR_OPTIONS.map((tipo) => (
                <SelectItem key={tipo} value={tipo}>
                  {tipo}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Proveedores</label>
          <Select
            value={filters.activo}
            onValueChange={(next) =>
              onFiltersChange({ ...filters, activo: (next ?? "activos") as ProveedorFilters["activo"] })
            }
          >
            <SelectTrigger className="w-full sm:w-36">
              <SelectValue>
                {() =>
                  filters.activo === "activos" ? "Activos" : filters.activo === "inactivos" ? "Inactivos" : "Todos"
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="activos">Activos</SelectItem>
              <SelectItem value="inactivos">Inactivos</SelectItem>
              <SelectItem value="todos">Todos</SelectItem>
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
