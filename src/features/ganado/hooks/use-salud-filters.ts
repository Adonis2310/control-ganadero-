"use client";

import { useMemo, useState } from "react";

import {
  DEFAULT_SALUD_FILTERS,
  type RegistroSalud,
  type SaludFilters,
} from "@/features/ganado/types";

const DIACRITICS_REGEX = /[̀-ͯ]/g;

function normalizar(texto: string) {
  return texto.toLowerCase().normalize("NFD").replace(DIACRITICS_REGEX, "");
}

export function useSaludFilters(registros: RegistroSalud[]) {
  const [filters, setFilters] = useState<SaludFilters>(DEFAULT_SALUD_FILTERS);
  const [estado, setEstado] = useState("todos");

  const filtered = useMemo(() => {
    const search = normalizar(filters.search.trim());

    return registros.filter((registro) => {
      if (search) {
        const haystack = normalizar(
          `${registro.animal?.identificador ?? ""} ${registro.animal?.nombre ?? ""} ${registro.titulo}`,
        );
        if (!haystack.includes(search)) return false;
      }
      if (filters.animalId !== "todos" && registro.animalId !== filters.animalId) return false;
      if (filters.tipo !== "todos" && registro.tipo !== filters.tipo) return false;
      if (filters.desde && registro.fecha < filters.desde) return false;
      if (filters.hasta && registro.fecha > filters.hasta) return false;
      if (estado !== "todos" && registro.estadoLabel !== estado) return false;
      return true;
    });
  }, [registros, filters, estado]);

  const hasActiveFilters =
    filters.search.trim() !== "" ||
    filters.animalId !== "todos" ||
    filters.tipo !== "todos" ||
    filters.desde !== "" ||
    filters.hasta !== "" ||
    estado !== "todos";

  function clearFilters() {
    setFilters(DEFAULT_SALUD_FILTERS);
    setEstado("todos");
  }

  return { filters, setFilters, estado, setEstado, filtered, hasActiveFilters, clearFilters };
}
