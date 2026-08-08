import { z } from "zod";

export const tratamientoFormSchema = z
  .object({
    enfermedad_id: z.string().optional().or(z.literal("")),
    tratamiento: z.string().trim().min(1, "El tratamiento es obligatorio.").max(120),
    medicamento: z.string().trim().max(120, "Máximo 120 caracteres.").optional().or(z.literal("")),
    fecha_inicio: z
      .string()
      .trim()
      .min(1, "La fecha de inicio es obligatoria.")
      .refine((value) => new Date(value) <= new Date(), {
        message: "La fecha de inicio no puede ser una fecha futura.",
      }),
    fecha_fin: z.string().trim().optional().or(z.literal("")),
    dosis: z.string().trim().max(80, "Máximo 80 caracteres.").optional().or(z.literal("")),
    frecuencia: z.string().trim().max(80, "Máximo 80 caracteres.").optional().or(z.literal("")),
    veterinario: z.string().trim().max(120, "Máximo 120 caracteres.").optional().or(z.literal("")),
    observaciones: z.string().max(500, "Máximo 500 caracteres.").optional().or(z.literal("")),
  })
  .refine((data) => !data.fecha_fin || data.fecha_fin >= data.fecha_inicio, {
    message: "La fecha de finalización no puede ser anterior a la fecha de inicio.",
    path: ["fecha_fin"],
  });

export type TratamientoFormValues = z.infer<typeof tratamientoFormSchema>;
export type TratamientoFormErrors = Partial<Record<keyof TratamientoFormValues, string>>;

export function validateTratamientoForm(values: TratamientoFormValues): TratamientoFormErrors {
  const result = tratamientoFormSchema.safeParse(values);
  if (result.success) return {};

  const errors: TratamientoFormErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as keyof TratamientoFormValues | undefined;
    if (field && !errors[field]) {
      errors[field] = issue.message;
    }
  }
  return errors;
}

function hoyISO(): string {
  return new Date().toISOString().split("T")[0];
}

export const EMPTY_TRATAMIENTO_FORM: TratamientoFormValues = {
  enfermedad_id: "",
  tratamiento: "",
  medicamento: "",
  fecha_inicio: hoyISO(),
  fecha_fin: "",
  dosis: "",
  frecuencia: "",
  veterinario: "",
  observaciones: "",
};
