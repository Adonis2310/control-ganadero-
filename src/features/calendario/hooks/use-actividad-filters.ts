"use client";

import { useMemo, useState } from "react";

import { DEFAULT_ACTIVIDAD_FILTERS, type ActividadConAnimal, type ActividadFilters } from "@/features/calendario/types";

const DIACRITICS_REGEX = /[̀-ͯ]/g;

function normalizar(texto: string) {
  return texto.toLowerCase().normalize("NFD").replace(DIACRITICS_REGEX, "");
}

export function useActividadFilters(actividades: ActividadConAnimal[]) {
  const [filters, setFilters] = useState<ActividadFilters>(DEFAULT_ACTIVIDAD_FILTERS);

  const filtered = useMemo(() => {
    const search = normalizar(filters.search.trim());

    return actividades.filter((actividad) => {
      if (search) {
        const haystack = normalizar(
          `${actividad.titulo} ${actividad.descripcion ?? ""} ${actividad.animal?.identificador ?? ""} ${actividad.animal?.nombre ?? ""}`,
        );
        if (!haystack.includes(search)) return false;
      }
      if (filters.tipo !== "todos" && actividad.tipo !== filters.tipo) return false;
      if (filters.estado !== "todos" && actividad.estado !== filters.estado) return false;
      if (filters.prioridad !== "todas" && actividad.prioridad !== filters.prioridad) return false;
      if (filters.animalId !== "todos" && actividad.animal_id !== filters.animalId) return false;
      if (filters.desde && actividad.fecha < filters.desde) return false;
      if (filters.hasta && actividad.fecha > filters.hasta) return false;
      return true;
    });
  }, [actividades, filters]);

  const hasActiveFilters =
    filters.search.trim() !== "" ||
    filters.tipo !== "todos" ||
    filters.estado !== "todos" ||
    filters.prioridad !== "todas" ||
    filters.animalId !== "todos" ||
    filters.desde !== "" ||
    filters.hasta !== "";

  function clearFilters() {
    setFilters(DEFAULT_ACTIVIDAD_FILTERS);
  }

  return { filters, setFilters, filtered, hasActiveFilters, clearFilters };
}
