"use client";

import { useMemo, useState } from "react";

import {
  DEFAULT_MOVIMIENTO_FILTERS,
  type MovimientoConProducto,
  type MovimientoFilters,
} from "@/features/inventario/types";

const DIACRITICS_REGEX = /[̀-ͯ]/g;

function normalizar(texto: string) {
  return texto.toLowerCase().normalize("NFD").replace(DIACRITICS_REGEX, "");
}

export function useMovimientoFilters(movimientos: MovimientoConProducto[]) {
  const [filters, setFilters] = useState<MovimientoFilters>(DEFAULT_MOVIMIENTO_FILTERS);

  const filtered = useMemo(() => {
    const search = normalizar(filters.search.trim());

    return movimientos.filter((movimiento) => {
      if (search) {
        const haystack = normalizar(`${movimiento.producto?.nombre ?? ""} ${movimiento.motivo}`);
        if (!haystack.includes(search)) return false;
      }
      if (filters.productoId !== "todos" && movimiento.producto_id !== filters.productoId) return false;
      if (filters.categoriaId !== "todos" && movimiento.producto?.categoria_id !== filters.categoriaId) return false;
      if (filters.tipo !== "todos" && movimiento.tipo !== filters.tipo) return false;
      if (filters.desde && movimiento.fecha < filters.desde) return false;
      if (filters.hasta && movimiento.fecha > filters.hasta) return false;
      return true;
    });
  }, [movimientos, filters]);

  const hasActiveFilters =
    filters.search.trim() !== "" ||
    filters.productoId !== "todos" ||
    filters.categoriaId !== "todos" ||
    filters.tipo !== "todos" ||
    filters.desde !== "" ||
    filters.hasta !== "";

  function clearFilters() {
    setFilters(DEFAULT_MOVIMIENTO_FILTERS);
  }

  return { filters, setFilters, filtered, hasActiveFilters, clearFilters };
}
