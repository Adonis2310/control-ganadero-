"use client";

import { Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ESTADO_COMPRA_OPTIONS, type CompraFilters } from "@/features/compras/types";
import { ESTADO_COMPRA_LABEL } from "@/features/compras/utils/compra.utils";
import type { ProveedorRef } from "@/features/proveedores/types";

interface PurchaseToolbarProps {
  filters: CompraFilters;
  onFiltersChange: (filters: CompraFilters) => void;
  proveedores: ProveedorRef[];
  hasActiveFilters: boolean;
  onClear: () => void;
}

export function PurchaseToolbar({
  filters,
  onFiltersChange,
  proveedores,
  hasActiveFilters,
  onClear,
}: PurchaseToolbarProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="relative sm:max-w-sm">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={filters.search}
          onChange={(event) => onFiltersChange({ ...filters, search: event.target.value })}
          placeholder="Buscar por proveedor..."
          className="pl-8"
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Proveedor</label>
          <Select
            value={filters.proveedorId}
            onValueChange={(next) => onFiltersChange({ ...filters, proveedorId: next ?? "todos" })}
          >
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue>
                {() => {
                  if (filters.proveedorId === "todos") return "Todos los proveedores";
                  return proveedores.find((p) => p.id === filters.proveedorId)?.nombre ?? "Todos los proveedores";
                }}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los proveedores</SelectItem>
              {proveedores.map((proveedor) => (
                <SelectItem key={proveedor.id} value={proveedor.id}>
                  {proveedor.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Estado</label>
          <Select
            value={filters.estado}
            onValueChange={(next) =>
              onFiltersChange({ ...filters, estado: (next ?? "todos") as CompraFilters["estado"] })
            }
          >
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue>{() => (filters.estado === "todos" ? "Todos" : ESTADO_COMPRA_LABEL[filters.estado])}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              {ESTADO_COMPRA_OPTIONS.map((option) => (
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
