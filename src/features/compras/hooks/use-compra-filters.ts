"use client";

import { useMemo, useState } from "react";

import {
  DEFAULT_COMPRA_FILTERS,
  type CompraConProveedor,
  type CompraFilters,
} from "@/features/compras/types";

const DIACRITICS_REGEX = /[̀-ͯ]/g;

function normalizar(texto: string) {
  return texto.toLowerCase().normalize("NFD").replace(DIACRITICS_REGEX, "");
}

export function useCompraFilters(compras: CompraConProveedor[]) {
  const [filters, setFilters] = useState<CompraFilters>(DEFAULT_COMPRA_FILTERS);

  const filtered = useMemo(() => {
    const search = normalizar(filters.search.trim());

    return compras.filter((compra) => {
      if (search) {
        const haystack = normalizar(
          `${compra.proveedor?.nombre ?? ""} ${compra.proveedor?.empresa ?? ""}`,
        );
        if (!haystack.includes(search)) return false;
      }
      if (filters.proveedorId !== "todos" && compra.proveedor_id !== filters.proveedorId) return false;
      if (filters.estado !== "todos" && compra.estado !== filters.estado) return false;
      if (filters.desde && compra.fecha < filters.desde) return false;
      if (filters.hasta && compra.fecha > filters.hasta) return false;
      return true;
    });
  }, [compras, filters]);

  const hasActiveFilters =
    filters.search.trim() !== "" ||
    filters.proveedorId !== "todos" ||
    filters.estado !== "todos" ||
    filters.desde !== "" ||
    filters.hasta !== "";

  function clearFilters() {
    setFilters(DEFAULT_COMPRA_FILTERS);
  }

  return { filters, setFilters, filtered, hasActiveFilters, clearFilters };
}
