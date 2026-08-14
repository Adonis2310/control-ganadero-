"use client";

import { Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CategoryGastoSelect } from "@/features/finanzas/components/category-gasto-select";
import type { CategoriaGastoRow, GastoFilters } from "@/features/finanzas/types";
import { METODO_PAGO_OPTIONS } from "@/features/ventas/types";

interface ExpenseFiltersProps {
  filters: GastoFilters;
  onFiltersChange: (filters: GastoFilters) => void;
  categorias: CategoriaGastoRow[];
  hasActiveFilters: boolean;
  onClear: () => void;
}

export function ExpenseFilters({ filters, onFiltersChange, categorias, hasActiveFilters, onClear }: ExpenseFiltersProps) {
  return (
    <div className="flex flex-col gap-3 rounded-xl bg-card p-4 ring-1 ring-foreground/10 backdrop-blur-xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.35)]">
      <div className="relative sm:max-w-sm">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={filters.search}
          onChange={(event) => onFiltersChange({ ...filters, search: event.target.value })}
          placeholder="Buscar por descripción, proveedor o animal..."
          className="pl-8"
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Categoría</label>
          <CategoryGastoSelect
            value={filters.categoriaId}
            onChange={(next) => onFiltersChange({ ...filters, categoriaId: next || "todas" })}
            categorias={categorias}
            includeTodas
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Método de pago</label>
          <Select
            value={filters.metodoPago}
            onValueChange={(next) => onFiltersChange({ ...filters, metodoPago: next ?? "todos" })}
          >
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue>{() => (filters.metodoPago === "todos" ? "Todos" : filters.metodoPago)}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              {METODO_PAGO_OPTIONS.map((metodo) => (
                <SelectItem key={metodo} value={metodo}>
                  {metodo}
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
