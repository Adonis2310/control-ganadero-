import type { Database } from "@/types/database.types";

export type FincaRow = Database["public"]["Tables"]["finca"]["Row"];
export type ConfiguracionSistemaRow = Database["public"]["Tables"]["configuracion_sistema"]["Row"];

export type Moneda = ConfiguracionSistemaRow["moneda"];
export type UnidadPeso = ConfiguracionSistemaRow["unidad_peso"];
export type PrimerDiaSemana = ConfiguracionSistemaRow["primer_dia_semana"];

export const MONEDA_OPTIONS: { value: Moneda; label: string }[] = [
  { value: "CRC", label: "CRC — Colón costarricense" },
  { value: "USD", label: "USD — Dólar estadounidense" },
];

export const UNIDAD_PESO_OPTIONS: { value: UnidadPeso; label: string }[] = [
  { value: "kg", label: "Kilogramos" },
  { value: "lb", label: "Libras" },
];

export const PRIMER_DIA_SEMANA_OPTIONS: { value: PrimerDiaSemana; label: string }[] = [
  { value: "domingo", label: "Domingo" },
  { value: "lunes", label: "Lunes" },
];

export const DECIMALES_OPTIONS = [0, 1, 2] as const;

/** Valores por defecto (sección 23): se usan mientras `configuracion_sistema` no tenga fila, o como fallback de formato. */
export const DEFAULT_CONFIGURACION_SISTEMA: Pick<
  ConfiguracionSistemaRow,
  "moneda" | "decimales" | "unidad_peso" | "alerta_stock_bajo" | "primer_dia_semana" | "horario_inicio" | "horario_fin"
> = {
  moneda: "CRC",
  decimales: 0,
  unidad_peso: "kg",
  alerta_stock_bajo: 10,
  primer_dia_semana: "lunes",
  horario_inicio: "07:00",
  horario_fin: "17:00",
};

export const DEFAULT_FARM_NAME = "Mi finca";
