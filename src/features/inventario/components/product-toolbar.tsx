"use client";

import { Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CategorySelect } from "@/features/inventario/components/category-select";
import type { CategoriaInventario, EstadoStock, ProductoFilters } from "@/features/inventario/types";
import { UNIDAD_MEDIDA_OPTIONS } from "@/features/inventario/types";
import { ESTADO_STOCK_LABEL } from "@/features/inventario/utils/inventario.utils";

interface ProductToolbarProps {
  filters: ProductoFilters;
  onFiltersChange: (filters: ProductoFilters) => void;
  categorias: CategoriaInventario[];
  hasActiveFilters: boolean;
  onClear: () => void;
}

export function ProductToolbar({
  filters,
  onFiltersChange,
  categorias,
  hasActiveFilters,
  onClear,
}: ProductToolbarProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="relative sm:max-w-sm">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={filters.search}
          onChange={(event) => onFiltersChange({ ...filters, search: event.target.value })}
          placeholder="Buscar por nombre o categoría..."
          className="pl-8"
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Categoría</label>
          <div className="w-full sm:w-48">
            <CategorySelect
              value={filters.categoriaId}
              onChange={(next) => onFiltersChange({ ...filters, categoriaId: next || "todos" })}
              categorias={categorias}
              includeTodas
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Estado del stock</label>
          <Select
            value={filters.estadoStock}
            onValueChange={(next) =>
              onFiltersChange({ ...filters, estadoStock: (next ?? "todos") as EstadoStock | "todos" })
            }
          >
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue>
                {() => (filters.estadoStock === "todos" ? "Todos" : ESTADO_STOCK_LABEL[filters.estadoStock])}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="disponible">Disponible</SelectItem>
              <SelectItem value="stock_bajo">Stock bajo</SelectItem>
              <SelectItem value="agotado">Agotado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Unidad</label>
          <Select
            value={filters.unidadMedida}
            onValueChange={(next) => onFiltersChange({ ...filters, unidadMedida: next ?? "todos" })}
          >
            <SelectTrigger className="w-full sm:w-36">
              <SelectValue>{() => (filters.unidadMedida === "todos" ? "Todas" : filters.unidadMedida)}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todas</SelectItem>
              {UNIDAD_MEDIDA_OPTIONS.map((unidad) => (
                <SelectItem key={unidad} value={unidad}>
                  {unidad}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Productos</label>
          <Select
            value={filters.activo}
            onValueChange={(next) =>
              onFiltersChange({ ...filters, activo: (next ?? "activos") as ProductoFilters["activo"] })
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
