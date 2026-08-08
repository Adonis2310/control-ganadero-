import { z } from "zod";

export const enfermedadFormSchema = z.object({
  enfermedad: z.string().trim().min(1, "El nombre de la enfermedad es obligatorio.").max(120),
  fecha_diagnostico: z
    .string()
    .trim()
    .min(1, "La fecha de diagnóstico es obligatoria.")
    .refine((value) => new Date(value) <= new Date(), {
      message: "La fecha de diagnóstico no puede ser una fecha futura.",
    }),
  descripcion: z.string().max(500, "Máximo 500 caracteres.").optional().or(z.literal("")),
  veterinario: z.string().trim().max(120, "Máximo 120 caracteres.").optional().or(z.literal("")),
  observaciones: z.string().max(500, "Máximo 500 caracteres.").optional().or(z.literal("")),
});

export type EnfermedadFormValues = z.infer<typeof enfermedadFormSchema>;
export type EnfermedadFormErrors = Partial<Record<keyof EnfermedadFormValues, string>>;

export function validateEnfermedadForm(values: EnfermedadFormValues): EnfermedadFormErrors {
  const result = enfermedadFormSchema.safeParse(values);
  if (result.success) return {};

  const errors: EnfermedadFormErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as keyof EnfermedadFormValues | undefined;
    if (field && !errors[field]) {
      errors[field] = issue.message;
    }
  }
  return errors;
}

function hoyISO(): string {
  return new Date().toISOString().split("T")[0];
}

export const EMPTY_ENFERMEDAD_FORM: EnfermedadFormValues = {
  enfermedad: "",
  fecha_diagnostico: hoyISO(),
  descripcion: "",
  veterinario: "",
  observaciones: "",
};

// ----------------------------------------------------------------------------
// Marcar una enfermedad como recuperada
// ----------------------------------------------------------------------------

export function recuperacionFormSchema(fechaDiagnostico: string) {
  return z
    .object({
      fecha_recuperacion: z
        .string()
        .trim()
        .min(1, "La fecha de recuperación es obligatoria.")
        .refine((value) => new Date(value) <= new Date(), {
          message: "La fecha de recuperación no puede ser una fecha futura.",
        }),
    })
    .refine((data) => data.fecha_recuperacion >= fechaDiagnostico, {
      message: "La fecha de recuperación no puede ser anterior al diagnóstico.",
      path: ["fecha_recuperacion"],
    });
}

export type RecuperacionFormValues = { fecha_recuperacion: string };
export type RecuperacionFormErrors = Partial<Record<keyof RecuperacionFormValues, string>>;

export function validateRecuperacionForm(
  values: RecuperacionFormValues,
  fechaDiagnostico: string,
): RecuperacionFormErrors {
  const result = recuperacionFormSchema(fechaDiagnostico).safeParse(values);
  if (result.success) return {};

  const errors: RecuperacionFormErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as keyof RecuperacionFormValues | undefined;
    if (field && !errors[field]) {
      errors[field] = issue.message;
    }
  }
  return errors;
}
