"use client";

import { createContext, useContext, type ReactNode } from "react";

import type { ConfiguracionSistemaRow, FincaRow } from "@/features/configuracion/types";
import { formatCurrency, formatWeight, formatWeightDelta, setCachedFormatOptions } from "@/features/configuracion/utils/format.utils";

interface ConfiguracionContextValue {
  finca: FincaRow | null;
  sistema: ConfiguracionSistemaRow;
}

const ConfiguracionContext = createContext<ConfiguracionContextValue | undefined>(undefined);

interface ConfiguracionProviderProps extends ConfiguracionContextValue {
  children: ReactNode;
}

/**
 * Fuente única de la configuración global (sección 15): se monta una sola
 * vez en `src/app/(protected)/layout.tsx`, alimentado por un fetch server-side,
 * y expone `finca`/`sistema` a toda la app vía contexto — evita que cada
 * componente vuelva a consultar Supabase para leer moneda, peso, etc.
 *
 * También sincroniza la caché de `formatCurrency`/`formatWeight` (usada por
 * `formatearMoneda`/`formatearPeso`, ya importados en ~40 componentes) en
 * cada render, para que esos componentes existentes respeten la
 * configuración sin tener que modificarlos uno por uno.
 */
export function ConfiguracionProvider({ finca, sistema, children }: ConfiguracionProviderProps) {
  setCachedFormatOptions(sistema);

  return <ConfiguracionContext.Provider value={{ finca, sistema }}>{children}</ConfiguracionContext.Provider>;
}

function useConfiguracionContext(): ConfiguracionContextValue {
  const context = useContext(ConfiguracionContext);
  if (!context) {
    throw new Error("useConfiguracion debe usarse dentro de <ConfiguracionProvider>.");
  }
  return context;
}

export function useConfiguracion(): ConfiguracionContextValue {
  return useConfiguracionContext();
}

export function useFincaInfo(): FincaRow | null {
  return useConfiguracionContext().finca;
}

export function useSystemSettings(): ConfiguracionSistemaRow {
  return useConfiguracionContext().sistema;
}

export function useFormatCurrency(): (value: number) => string {
  const { moneda, decimales } = useSystemSettings();
  return (value: number) => formatCurrency(value, { moneda, decimales });
}

export function useFormatWeight(): {
  format: (value: number | null) => string;
  formatDelta: (value: number | null) => string;
} {
  const { unidad_peso } = useSystemSettings();
  return {
    format: (value: number | null) => formatWeight(value, { unidad: unidad_peso }),
    formatDelta: (value: number | null) => formatWeightDelta(value, { unidad: unidad_peso }),
  };
}
