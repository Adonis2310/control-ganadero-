"use client";

import { useMemo, useState } from "react";

import {
  DEFAULT_REPRODUCCION_FILTERS,
  type AnimalReproductivo,
  type ReproduccionFilters,
} from "@/features/ganado/types";

const DIACRITICS_REGEX = /[̀-ͯ]/g;

function normalizar(texto: string) {
  return texto.toLowerCase().normalize("NFD").replace(DIACRITICS_REGEX, "");
}

export function useReproduccionFilters(listado: AnimalReproductivo[]) {
  const [filters, setFilters] = useState<ReproduccionFilters>(DEFAULT_REPRODUCCION_FILTERS);

  const filtered = useMemo(() => {
    const search = normalizar(filters.search.trim());

    return listado.filter((fila) => {
      if (search) {
        const haystack = normalizar(`${fila.animal.identificador} ${fila.animal.nombre ?? ""}`);
        if (!haystack.includes(search)) return false;
      }
      if (filters.animalId !== "todos" && fila.animal.id !== filters.animalId) return false;
      if (filters.sexo !== "todos" && fila.animal.sexo !== filters.sexo) return false;
      if (filters.estadoReproductivo !== "todos" && fila.estado !== filters.estadoReproductivo) {
        return false;
      }
      if (filters.estadoGestacion !== "todos") {
        if (!fila.gestacionActual || fila.gestacionActual.estado !== filters.estadoGestacion) {
          return false;
        }
      }
      if (filters.desde && (!fila.ultimoEvento || fila.ultimoEvento.fecha < filters.desde)) {
        return false;
      }
      if (filters.hasta && (!fila.ultimoEvento || fila.ultimoEvento.fecha > filters.hasta)) {
        return false;
      }
      return true;
    });
  }, [listado, filters]);

  const hasActiveFilters =
    filters.search.trim() !== "" ||
    filters.animalId !== "todos" ||
    filters.sexo !== "todos" ||
    filters.estadoReproductivo !== "todos" ||
    filters.estadoGestacion !== "todos" ||
    filters.desde !== "" ||
    filters.hasta !== "";

  function clearFilters() {
    setFilters(DEFAULT_REPRODUCCION_FILTERS);
  }

  return { filters, setFilters, filtered, hasActiveFilters, clearFilters };
}
