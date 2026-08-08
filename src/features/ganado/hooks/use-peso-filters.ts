"use client";

import { useMemo, useState } from "react";

import {
  DEFAULT_PESO_FILTERS,
  type PesoConAnimal,
  type PesoFilters,
} from "@/features/ganado/types";

export type PesoOrden = "fecha_desc" | "fecha_asc" | "peso_desc" | "peso_asc";

const DIACRITICS_REGEX = /[̀-ͯ]/g;

function normalizar(texto: string) {
  return texto.toLowerCase().normalize("NFD").replace(DIACRITICS_REGEX, "");
}

export function usePesoFilters(pesos: PesoConAnimal[]) {
  const [filters, setFilters] = useState<PesoFilters>(DEFAULT_PESO_FILTERS);
  const [orden, setOrden] = useState<PesoOrden>("fecha_desc");

  const filtered = useMemo(() => {
    const search = normalizar(filters.search.trim());

    const result = pesos.filter((peso) => {
      if (search) {
        const haystack = normalizar(
          `${peso.animal?.identificador ?? ""} ${peso.animal?.nombre ?? ""}`,
        );
        if (!haystack.includes(search)) return false;
      }
      if (filters.desde && peso.fecha < filters.desde) return false;
      if (filters.hasta && peso.fecha > filters.hasta) return false;
      if (filters.pesoMin && peso.peso < Number(filters.pesoMin)) return false;
      if (filters.pesoMax && peso.peso > Number(filters.pesoMax)) return false;
      return true;
    });

    const sorted = [...result].sort((a, b) => {
      switch (orden) {
        case "fecha_asc":
          return a.fecha.localeCompare(b.fecha);
        case "peso_desc":
          return b.peso - a.peso;
        case "peso_asc":
          return a.peso - b.peso;
        case "fecha_desc":
        default:
          return b.fecha.localeCompare(a.fecha);
      }
    });

    return sorted;
  }, [pesos, filters, orden]);

  const hasActiveFilters =
    filters.search.trim() !== "" ||
    filters.desde !== "" ||
    filters.hasta !== "" ||
    filters.pesoMin !== "" ||
    filters.pesoMax !== "";

  function clearFilters() {
    setFilters(DEFAULT_PESO_FILTERS);
  }

  return { filters, setFilters, orden, setOrden, filtered, hasActiveFilters, clearFilters };
}
