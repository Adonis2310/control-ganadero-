"use client";

import { useMemo, useState } from "react";

import { DEFAULT_CLIENTE_FILTERS, type ClienteFilters, type ClienteRow } from "@/features/clientes/types";

const DIACRITICS_REGEX = /[̀-ͯ]/g;

function normalizar(texto: string) {
  return texto.toLowerCase().normalize("NFD").replace(DIACRITICS_REGEX, "");
}

export function useClienteFilters(clientes: ClienteRow[]) {
  const [filters, setFilters] = useState<ClienteFilters>(DEFAULT_CLIENTE_FILTERS);

  const filtered = useMemo(() => {
    const search = normalizar(filters.search.trim());

    return clientes.filter((cliente) => {
      if (search) {
        const haystack = normalizar(
          `${cliente.nombre} ${cliente.identificacion ?? ""} ${cliente.telefono ?? ""}`,
        );
        if (!haystack.includes(search)) return false;
      }
      if (filters.activo === "activos" && !cliente.activo) return false;
      if (filters.activo === "inactivos" && cliente.activo) return false;
      return true;
    });
  }, [clientes, filters]);

  const hasActiveFilters = filters.search.trim() !== "" || filters.activo !== "activos";

  function clearFilters() {
    setFilters(DEFAULT_CLIENTE_FILTERS);
  }

  return { filters, setFilters, filtered, hasActiveFilters, clearFilters };
}
