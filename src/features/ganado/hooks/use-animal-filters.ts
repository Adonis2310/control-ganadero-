"use client";

import { useMemo, useState } from "react";

import {
  DEFAULT_ANIMAL_FILTERS,
  type Animal,
  type AnimalFilters,
} from "@/features/ganado/types";

const DIACRITICS_REGEX = /[̀-ͯ]/g;

function normalizar(texto: string) {
  return texto.toLowerCase().normalize("NFD").replace(DIACRITICS_REGEX, "");
}

export function useAnimalFilters(animales: Animal[]) {
  const [filters, setFilters] = useState<AnimalFilters>(DEFAULT_ANIMAL_FILTERS);

  const filtered = useMemo(() => {
    const search = normalizar(filters.search.trim());

    return animales.filter((animal) => {
      if (search) {
        const haystack = normalizar(`${animal.identificador} ${animal.nombre ?? ""}`);
        if (!haystack.includes(search)) return false;
      }
      if (filters.sexo !== "todos" && animal.sexo !== filters.sexo) return false;
      if (filters.razaId !== "todos" && animal.raza_id !== filters.razaId) return false;
      if (filters.estado !== "todos" && animal.estado !== filters.estado) return false;
      return true;
    });
  }, [animales, filters]);

  const hasActiveFilters =
    filters.search.trim() !== "" ||
    filters.sexo !== "todos" ||
    filters.razaId !== "todos" ||
    filters.estado !== "todos";

  function clearFilters() {
    setFilters(DEFAULT_ANIMAL_FILTERS);
  }

  return { filters, setFilters, filtered, hasActiveFilters, clearFilters };
}
