"use client";

import { Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CategorySelect } from "@/features/inventario/components/category-select";
import type { CategoriaInventario, MovimientoFilters, ProductoRef, TipoMovimiento } from "@/features/inventario/types";

const TIPO_LABEL: Record<TipoMovimiento, string> = {
  entrada: "Entrada",
  salida: "Salida",
  ajuste: "Ajuste",
};

interface MovementToolbarProps {
  filters: MovimientoFilters;
  onFiltersChange: (filters: MovimientoFilters) => void;
  productos: ProductoRef[];
  categorias: CategoriaInventario[];
  hasActiveFilters: boolean;
  onClear: () => void;
}

export function MovementToolbar({
  filters,
  onFiltersChange,
  productos,
  categorias,
  hasActiveFilters,
  onClear,
}: MovementToolbarProps) {
  return (
    <div className="flex flex-col gap-3 rounded-xl bg-card p-4 ring-1 ring-foreground/10 backdrop-blur-xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.35)]">
      <div className="relative sm:max-w-sm">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={filters.search}
          onChange={(event) => onFiltersChange({ ...filters, search: event.target.value })}
          placeholder="Buscar por producto o motivo..."
          className="pl-8"
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Producto</label>
          <Select
            value={filters.productoId}
            onValueChange={(next) => onFiltersChange({ ...filters, productoId: next ?? "todos" })}
          >
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue>
                {() => {
                  if (filters.productoId === "todos") return "Todos los productos";
                  return productos.find((p) => p.id === filters.productoId)?.nombre ?? "Todos los productos";
                }}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los productos</SelectItem>
              {productos.map((producto) => (
                <SelectItem key={producto.id} value={producto.id}>
                  {producto.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Categoría</label>
          <div className="w-full sm:w-44">
            <CategorySelect
              value={filters.categoriaId}
              onChange={(next) => onFiltersChange({ ...filters, categoriaId: next || "todos" })}
              categorias={categorias}
              includeTodas
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Tipo</label>
          <Select
            value={filters.tipo}
            onValueChange={(next) =>
              onFiltersChange({ ...filters, tipo: (next ?? "todos") as TipoMovimiento | "todos" })
            }
          >
            <SelectTrigger className="w-full sm:w-36">
              <SelectValue>{() => (filters.tipo === "todos" ? "Todos" : TIPO_LABEL[filters.tipo])}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="entrada">Entrada</SelectItem>
              <SelectItem value="salida">Salida</SelectItem>
              <SelectItem value="ajuste">Ajuste</SelectItem>
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
