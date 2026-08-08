"use client";

import { useMemo, useState } from "react";

import {
  DEFAULT_PROVEEDOR_FILTERS,
  type ProveedorFilters,
  type ProveedorRow,
} from "@/features/proveedores/types";

const DIACRITICS_REGEX = /[̀-ͯ]/g;

function normalizar(texto: string) {
  return texto.toLowerCase().normalize("NFD").replace(DIACRITICS_REGEX, "");
}

export function useProveedorFilters(proveedores: ProveedorRow[]) {
  const [filters, setFilters] = useState<ProveedorFilters>(DEFAULT_PROVEEDOR_FILTERS);

  const filtered = useMemo(() => {
    const search = normalizar(filters.search.trim());

    return proveedores.filter((proveedor) => {
      if (search) {
        const haystack = normalizar(
          `${proveedor.nombre} ${proveedor.empresa ?? ""} ${proveedor.telefono ?? ""}`,
        );
        if (!haystack.includes(search)) return false;
      }
      if (filters.tipo !== "todos" && proveedor.tipo !== filters.tipo) return false;
      if (filters.activo === "activos" && !proveedor.activo) return false;
      if (filters.activo === "inactivos" && proveedor.activo) return false;
      return true;
    });
  }, [proveedores, filters]);

  const hasActiveFilters =
    filters.search.trim() !== "" || filters.tipo !== "todos" || filters.activo !== "activos";

  function clearFilters() {
    setFilters(DEFAULT_PROVEEDOR_FILTERS);
  }

  return { filters, setFilters, filtered, hasActiveFilters, clearFilters };
}
