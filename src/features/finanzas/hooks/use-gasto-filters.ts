"use client";

import { useMemo, useState } from "react";

import { DEFAULT_GASTO_FILTERS, type GastoConReferencias, type GastoFilters } from "@/features/finanzas/types";

const DIACRITICS_REGEX = /[̀-ͯ]/g;

function normalizar(texto: string) {
  return texto.toLowerCase().normalize("NFD").replace(DIACRITICS_REGEX, "");
}

export function useGastoFilters(gastos: GastoConReferencias[]) {
  const [filters, setFilters] = useState<GastoFilters>(DEFAULT_GASTO_FILTERS);

  const filtered = useMemo(() => {
    const search = normalizar(filters.search.trim());

    return gastos.filter((gasto) => {
      if (search) {
        const haystack = normalizar(
          `${gasto.descripcion} ${gasto.proveedor?.nombre ?? ""} ${gasto.animal?.identificador ?? ""} ${gasto.animal?.nombre ?? ""}`,
        );
        if (!haystack.includes(search)) return false;
      }
      if (filters.categoriaId !== "todas" && gasto.categoria_id !== filters.categoriaId) return false;
      if (filters.metodoPago !== "todos" && gasto.metodo_pago !== filters.metodoPago) return false;
      if (filters.desde && gasto.fecha < filters.desde) return false;
      if (filters.hasta && gasto.fecha > filters.hasta) return false;
      return true;
    });
  }, [gastos, filters]);

  const hasActiveFilters =
    filters.search.trim() !== "" ||
    filters.categoriaId !== "todas" ||
    filters.metodoPago !== "todos" ||
    filters.desde !== "" ||
    filters.hasta !== "";

  function clearFilters() {
    setFilters(DEFAULT_GASTO_FILTERS);
  }

  return { filters, setFilters, filtered, hasActiveFilters, clearFilters };
}
