import { DEFAULT_CONFIGURACION_SISTEMA, type ConfiguracionSistemaRow, type Moneda, type UnidadPeso } from "@/features/configuracion/types";

export interface CurrencyFormatOptions {
  moneda: Moneda;
  decimales: number;
}

export interface WeightFormatOptions {
  unidad: UnidadPeso;
}

const MONEDA_SIMBOLO: Record<Moneda, string> = {
  CRC: "₡",
  USD: "$",
};

const KG_A_LB = 2.20462;

/**
 * Caché en memoria de las opciones de formato activas. Es la pieza que
 * permite que `formatearMoneda`/`formatearPeso` (y decenas de componentes
 * que ya los usan en toda la app) respeten la configuración SIN tener que
 * tocar cada punto de uso: se actualiza una vez por render desde
 * `ConfiguracionProvider` (ver hooks/use-configuracion.tsx) y de ahí en
 * adelante estas funciones ya la leen por defecto.
 */
let cachedCurrencyOptions: CurrencyFormatOptions = {
  moneda: DEFAULT_CONFIGURACION_SISTEMA.moneda,
  decimales: DEFAULT_CONFIGURACION_SISTEMA.decimales,
};
let cachedWeightOptions: WeightFormatOptions = { unidad: DEFAULT_CONFIGURACION_SISTEMA.unidad_peso };

export function setCachedFormatOptions(
  sistema: Pick<ConfiguracionSistemaRow, "moneda" | "decimales" | "unidad_peso">,
): void {
  cachedCurrencyOptions = { moneda: sistema.moneda, decimales: sistema.decimales };
  cachedWeightOptions = { unidad: sistema.unidad_peso };
}

export function getCachedCurrencyOptions(): CurrencyFormatOptions {
  return cachedCurrencyOptions;
}

export function getCachedWeightOptions(): WeightFormatOptions {
  return cachedWeightOptions;
}

/** Formateador monetario centralizado (sección 16): moneda y decimales configurados, nunca convierte el valor almacenado. */
export function formatCurrency(value: number, options: CurrencyFormatOptions = cachedCurrencyOptions): string {
  const simbolo = MONEDA_SIMBOLO[options.moneda];
  return `${simbolo}${value.toLocaleString("es-CR", {
    minimumFractionDigits: options.decimales,
    maximumFractionDigits: options.decimales,
  })}`;
}

/** Versión abreviada ($45k, ₡1.2M) para ejes de gráficos, con el mismo símbolo configurado. */
export function formatCurrencyCompact(value: number, options: CurrencyFormatOptions = cachedCurrencyOptions): string {
  const simbolo = MONEDA_SIMBOLO[options.moneda];
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `${simbolo}${(value / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${simbolo}${(value / 1_000).toFixed(0)}k`;
  return `${simbolo}${value.toFixed(0)}`;
}

/**
 * Formateador de peso centralizado (sección 17). El valor SIEMPRE se
 * almacena en kilogramos en la base de datos (sección 8: no se convierten
 * datos históricos); esta función solo decide cómo se MUESTRA.
 */
export function formatWeight(valueKg: number | null, options: WeightFormatOptions = cachedWeightOptions): string {
  if (valueKg === null || valueKg === undefined) return "Sin registrar";
  if (options.unidad === "lb") {
    return `${(valueKg * KG_A_LB).toLocaleString("es", { maximumFractionDigits: 1 })} lb`;
  }
  return `${valueKg.toLocaleString("es", { maximumFractionDigits: 1 })} kg`;
}

/** Igual que `formatWeight`, pero para una variación (+70 kg / -12 lb), preservando el signo. */
export function formatWeightDelta(deltaKg: number | null, options: WeightFormatOptions = cachedWeightOptions): string {
  if (deltaKg === null) return "—";
  const signo = deltaKg > 0 ? "+" : "";
  const valor = options.unidad === "lb" ? deltaKg * KG_A_LB : deltaKg;
  const unidad = options.unidad === "lb" ? "lb" : "kg";
  return `${signo}${valor.toLocaleString("es", { maximumFractionDigits: 1 })} ${unidad}`;
}
