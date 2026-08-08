"use client";

import { useMemo, useState } from "react";

import {
  DEFAULT_PRODUCTO_FILTERS,
  type ProductoFilters,
  type ProductoInventario,
} from "@/features/inventario/types";
import { calcularEstadoStock } from "@/features/inventario/utils/inventario.utils";

const DIACRITICS_REGEX = /[̀-ͯ]/g;

function normalizar(texto: string) {
  return texto.toLowerCase().normalize("NFD").replace(DIACRITICS_REGEX, "");
}

export function useProductoFilters(productos: ProductoInventario[]) {
  const [filters, setFilters] = useState<ProductoFilters>(DEFAULT_PRODUCTO_FILTERS);

  const filtered = useMemo(() => {
    const search = normalizar(filters.search.trim());

    return productos.filter((producto) => {
      if (search) {
        const haystack = normalizar(`${producto.nombre} ${producto.categoria?.nombre ?? ""}`);
        if (!haystack.includes(search)) return false;
      }
      if (filters.categoriaId !== "todos" && producto.categoria_id !== filters.categoriaId) return false;
      if (filters.estadoStock !== "todos" && calcularEstadoStock(producto) !== filters.estadoStock) return false;
      if (filters.unidadMedida !== "todos" && producto.unidad_medida !== filters.unidadMedida) return false;
      if (filters.activo === "activos" && !producto.activo) return false;
      if (filters.activo === "inactivos" && producto.activo) return false;
      return true;
    });
  }, [productos, filters]);

  const hasActiveFilters =
    filters.search.trim() !== "" ||
    filters.categoriaId !== "todos" ||
    filters.estadoStock !== "todos" ||
    filters.unidadMedida !== "todos" ||
    filters.activo !== "activos";

  function clearFilters() {
    setFilters(DEFAULT_PRODUCTO_FILTERS);
  }

  return { filters, setFilters, filtered, hasActiveFilters, clearFilters };
}
