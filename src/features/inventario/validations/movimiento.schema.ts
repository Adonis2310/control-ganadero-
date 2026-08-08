import { z } from "zod";

function hoyISO(): string {
  return new Date().toISOString().split("T")[0];
}

const fechaSchema = z
  .string()
  .trim()
  .min(1, "La fecha es obligatoria.")
  .refine((value) => new Date(value) <= new Date(), {
    message: "La fecha no puede ser una fecha futura.",
  });

const cantidadPositivaSchema = z
  .string()
  .trim()
  .min(1, "La cantidad es obligatoria.")
  .refine((value) => !Number.isNaN(Number(value)) && Number(value) > 0, {
    message: "La cantidad debe ser un número mayor que 0.",
  });

const costoOpcionalSchema = z
  .string()
  .optional()
  .or(z.literal(""))
  .refine((value) => !value || (!Number.isNaN(Number(value)) && Number(value) >= 0), {
    message: "El costo unitario debe ser un número válido mayor o igual a 0.",
  });

const motivoSchema = z.string().trim().min(1, "El motivo es obligatorio.").max(200, "Máximo 200 caracteres.");
const observacionesSchema = z.string().max(500, "Máximo 500 caracteres.").optional().or(z.literal(""));

// ----------------------------------------------------------------------------
// Entrada
// ----------------------------------------------------------------------------

export const entradaFormSchema = z.object({
  fecha: fechaSchema,
  cantidad: cantidadPositivaSchema,
  costo_unitario: costoOpcionalSchema,
  motivo: motivoSchema,
  observaciones: observacionesSchema,
});

export type EntradaFormValues = z.infer<typeof entradaFormSchema>;
export type EntradaFormErrors = Partial<Record<keyof EntradaFormValues, string>>;

export function validateEntradaForm(values: EntradaFormValues): EntradaFormErrors {
  const result = entradaFormSchema.safeParse(values);
  if (result.success) return {};
  const errors: EntradaFormErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as keyof EntradaFormValues | undefined;
    if (field && !errors[field]) errors[field] = issue.message;
  }
  return errors;
}

export const EMPTY_ENTRADA_FORM: EntradaFormValues = {
  fecha: hoyISO(),
  cantidad: "",
  costo_unitario: "",
  motivo: "",
  observaciones: "",
};

// ----------------------------------------------------------------------------
// Salida
// ----------------------------------------------------------------------------

export const salidaFormSchema = z.object({
  fecha: fechaSchema,
  cantidad: cantidadPositivaSchema,
  motivo: motivoSchema,
  observaciones: observacionesSchema,
});

export type SalidaFormValues = z.infer<typeof salidaFormSchema>;
export type SalidaFormErrors = Partial<Record<keyof SalidaFormValues, string>>;

export function validateSalidaForm(values: SalidaFormValues): SalidaFormErrors {
  const result = salidaFormSchema.safeParse(values);
  if (result.success) return {};
  const errors: SalidaFormErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as keyof SalidaFormValues | undefined;
    if (field && !errors[field]) errors[field] = issue.message;
  }
  return errors;
}

export const EMPTY_SALIDA_FORM: SalidaFormValues = {
  fecha: hoyISO(),
  cantidad: "",
  motivo: "",
  observaciones: "",
};

// ----------------------------------------------------------------------------
// Ajuste
// ----------------------------------------------------------------------------

export const ajusteFormSchema = z.object({
  nueva_cantidad: z
    .string()
    .trim()
    .min(1, "La nueva cantidad es obligatoria.")
    .refine((value) => !Number.isNaN(Number(value)) && Number(value) >= 0, {
      message: "La nueva cantidad debe ser un número válido mayor o igual a 0.",
    }),
  motivo: motivoSchema,
  observaciones: observacionesSchema,
});

export type AjusteFormValues = z.infer<typeof ajusteFormSchema>;
export type AjusteFormErrors = Partial<Record<keyof AjusteFormValues, string>>;

export function validateAjusteForm(values: AjusteFormValues): AjusteFormErrors {
  const result = ajusteFormSchema.safeParse(values);
  if (result.success) return {};
  const errors: AjusteFormErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as keyof AjusteFormValues | undefined;
    if (field && !errors[field]) errors[field] = issue.message;
  }
  return errors;
}

export const EMPTY_AJUSTE_FORM: AjusteFormValues = {
  nueva_cantidad: "",
  motivo: "",
  observaciones: "",
};
