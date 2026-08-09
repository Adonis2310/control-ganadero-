import { z } from "zod";

import { DEFAULT_CONFIGURACION_SISTEMA, type ConfiguracionSistemaRow } from "@/features/configuracion/types";

// ----------------------------------------------------------------------------
// Preferencias: moneda, decimales, unidad de peso
// ----------------------------------------------------------------------------

export const preferencesFormSchema = z.object({
  moneda: z.enum(["CRC", "USD"]),
  decimales: z
    .string()
    .trim()
    .min(1, "Selecciona la cantidad de decimales.")
    .refine((value) => !Number.isNaN(Number(value)) && Number.isInteger(Number(value)) && Number(value) >= 0 && Number(value) <= 4, {
      message: "Los decimales deben ser un número entero entre 0 y 4.",
    }),
  unidad_peso: z.enum(["kg", "lb"]),
});

export type PreferencesFormValues = z.infer<typeof preferencesFormSchema>;
export type PreferencesFormErrors = Partial<Record<keyof PreferencesFormValues, string>>;

export function validatePreferencesForm(values: PreferencesFormValues): PreferencesFormErrors {
  const result = preferencesFormSchema.safeParse(values);
  if (result.success) return {};
  const errors: PreferencesFormErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as keyof PreferencesFormValues | undefined;
    if (field && !errors[field]) errors[field] = issue.message;
  }
  return errors;
}

// ----------------------------------------------------------------------------
// Inventario: alerta de stock bajo
// ----------------------------------------------------------------------------

export const inventorySettingsFormSchema = z.object({
  alerta_stock_bajo: z
    .string()
    .trim()
    .min(1, "El stock mínimo es obligatorio.")
    .refine((value) => !Number.isNaN(Number(value)) && Number(value) >= 0, {
      message: "El stock mínimo debe ser un número válido mayor o igual a 0.",
    }),
});

export type InventorySettingsFormValues = z.infer<typeof inventorySettingsFormSchema>;
export type InventorySettingsFormErrors = Partial<Record<keyof InventorySettingsFormValues, string>>;

export function validateInventorySettingsForm(values: InventorySettingsFormValues): InventorySettingsFormErrors {
  const result = inventorySettingsFormSchema.safeParse(values);
  if (result.success) return {};
  const errors: InventorySettingsFormErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as keyof InventorySettingsFormValues | undefined;
    if (field && !errors[field]) errors[field] = issue.message;
  }
  return errors;
}

// ----------------------------------------------------------------------------
// Calendario: primer día de la semana y horario visual
// ----------------------------------------------------------------------------

export const calendarSettingsFormSchema = z
  .object({
    primer_dia_semana: z.enum(["domingo", "lunes"]),
    horario_inicio: z.string().trim().min(1, "La hora inicial es obligatoria."),
    horario_fin: z.string().trim().min(1, "La hora final es obligatoria."),
  })
  .refine((data) => data.horario_inicio < data.horario_fin, {
    message: "La hora inicial no debe ser posterior a la hora final.",
    path: ["horario_fin"],
  });

export type CalendarSettingsFormValues = z.infer<typeof calendarSettingsFormSchema>;
export type CalendarSettingsFormErrors = Partial<Record<keyof CalendarSettingsFormValues, string>>;

export function validateCalendarSettingsForm(values: CalendarSettingsFormValues): CalendarSettingsFormErrors {
  const result = calendarSettingsFormSchema.safeParse(values);
  if (result.success) return {};
  const errors: CalendarSettingsFormErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as keyof CalendarSettingsFormValues | undefined;
    if (field && !errors[field]) errors[field] = issue.message;
  }
  return errors;
}

// ----------------------------------------------------------------------------
// Helpers para prellenar los formularios desde la fila de configuración
// ----------------------------------------------------------------------------

export function sistemaToPreferencesForm(sistema: ConfiguracionSistemaRow | null): PreferencesFormValues {
  const base = sistema ?? DEFAULT_CONFIGURACION_SISTEMA;
  return { moneda: base.moneda, decimales: String(base.decimales), unidad_peso: base.unidad_peso };
}

export function sistemaToInventoryForm(sistema: ConfiguracionSistemaRow | null): InventorySettingsFormValues {
  const base = sistema ?? DEFAULT_CONFIGURACION_SISTEMA;
  return { alerta_stock_bajo: String(base.alerta_stock_bajo) };
}

export function sistemaToCalendarForm(sistema: ConfiguracionSistemaRow | null): CalendarSettingsFormValues {
  const base = sistema ?? DEFAULT_CONFIGURACION_SISTEMA;
  return {
    primer_dia_semana: base.primer_dia_semana,
    horario_inicio: base.horario_inicio.slice(0, 5),
    horario_fin: base.horario_fin.slice(0, 5),
  };
}
