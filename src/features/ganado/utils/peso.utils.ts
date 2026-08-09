import { formatWeightDelta } from "@/features/configuracion/utils/format.utils";
import type {
  PesoConAnimal,
  PesoConVariacion,
  PesoRow,
  PesoStats,
} from "@/features/ganado/types";

/** Ordena por fecha ascendente (y created_at como desempate) para cálculos cronológicos. */
function ordenarPorFechaAsc(pesos: PesoRow[]): PesoRow[] {
  return [...pesos].sort((a, b) => {
    const diff = a.fecha.localeCompare(b.fecha);
    return diff !== 0 ? diff : a.created_at.localeCompare(b.created_at);
  });
}

/** Agrega la variación (kg y %) de cada pesaje respecto al anterior cronológicamente. */
export function calcularVariaciones(pesos: PesoRow[]): PesoConVariacion[] {
  const ordenados = ordenarPorFechaAsc(pesos);

  return ordenados.map((peso, index) => {
    if (index === 0) {
      return { ...peso, variacionKg: null, variacionPorcentaje: null };
    }
    const anterior = ordenados[index - 1];
    const variacionKg = Number((peso.peso - anterior.peso).toFixed(2));
    const variacionPorcentaje =
      anterior.peso > 0 ? Number(((variacionKg / anterior.peso) * 100).toFixed(1)) : null;
    return { ...peso, variacionKg, variacionPorcentaje };
  });
}

export function calcularPesoStats(pesos: PesoRow[]): PesoStats {
  if (pesos.length === 0) {
    return {
      pesoActual: null,
      pesoInicial: null,
      pesoMaximo: null,
      pesoMinimo: null,
      gananciaTotalKg: null,
      gananciaPromedioKg: null,
      cantidadPesajes: 0,
    };
  }

  const ordenados = ordenarPorFechaAsc(pesos);
  const valores = ordenados.map((p) => p.peso);
  const primero = ordenados[0];
  const ultimo = ordenados[ordenados.length - 1];

  const gananciaTotalKg = Number((ultimo.peso - primero.peso).toFixed(2));
  const gananciaPromedioKg =
    ordenados.length > 1 ? Number((gananciaTotalKg / (ordenados.length - 1)).toFixed(2)) : null;

  return {
    pesoActual: ultimo.peso,
    pesoInicial: primero.peso,
    pesoMaximo: Math.max(...valores),
    pesoMinimo: Math.min(...valores),
    gananciaTotalKg,
    gananciaPromedioKg,
    cantidadPesajes: ordenados.length,
  };
}

/**
 * Calcula la variación de cada pesaje respecto al anterior DEL MISMO
 * ANIMAL, para listas que mezclan pesajes de varios animales (página
 * general). El orden de salida no cambia respecto al de entrada.
 */
export function calcularVariacionesPorAnimal<T extends PesoConAnimal>(
  pesos: T[],
): (T & { variacionKg: number | null; variacionPorcentaje: number | null })[] {
  const porAnimal = new Map<string, PesoRow[]>();
  for (const peso of pesos) {
    const lista = porAnimal.get(peso.animal_id) ?? [];
    lista.push(peso);
    porAnimal.set(peso.animal_id, lista);
  }

  const variacionPorId = new Map<string, { variacionKg: number | null; variacionPorcentaje: number | null }>();
  for (const lista of porAnimal.values()) {
    for (const conVariacion of calcularVariaciones(lista)) {
      variacionPorId.set(conVariacion.id, {
        variacionKg: conVariacion.variacionKg,
        variacionPorcentaje: conVariacion.variacionPorcentaje,
      });
    }
  }

  return pesos.map((peso) => ({
    ...peso,
    ...(variacionPorId.get(peso.id) ?? { variacionKg: null, variacionPorcentaje: null }),
  }));
}

/** Delega en `formatWeightDelta` (sección 17 de la Fase 12): respeta la unidad de peso configurada (kg/lb). */
export function formatearVariacion(kg: number | null): string {
  return formatWeightDelta(kg);
}

export function formatearPorcentaje(pct: number | null): string {
  if (pct === null) return "";
  const signo = pct > 0 ? "+" : "";
  return `${signo}${pct.toLocaleString("es", { maximumFractionDigits: 1 })}%`;
}
