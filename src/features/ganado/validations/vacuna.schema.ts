import { z } from "zod";

export const vacunaFormSchema = z
  .object({
    nombre: z.string().trim().min(1, "El nombre de la vacuna es obligatorio.").max(120),
    fecha_aplicacion: z
      .string()
      .trim()
      .min(1, "La fecha de aplicación es obligatoria.")
      .refine((value) => new Date(value) <= new Date(), {
        message: "La fecha de aplicación no puede ser una fecha futura.",
      }),
    proxima_aplicacion: z.string().trim().optional().or(z.literal("")),
    dosis: z.string().trim().max(80, "Máximo 80 caracteres.").optional().or(z.literal("")),
    veterinario: z.string().trim().max(120, "Máximo 120 caracteres.").optional().or(z.literal("")),
    observaciones: z.string().max(500, "Máximo 500 caracteres.").optional().or(z.literal("")),
  })
  .refine(
    (data) => !data.proxima_aplicacion || data.proxima_aplicacion >= data.fecha_aplicacion,
    {
      message: "La próxima aplicación no puede ser anterior a la fecha de aplicación.",
      path: ["proxima_aplicacion"],
    },
  );

export type VacunaFormValues = z.infer<typeof vacunaFormSchema>;
export type VacunaFormErrors = Partial<Record<keyof VacunaFormValues, string>>;

export function validateVacunaForm(values: VacunaFormValues): VacunaFormErrors {
  const result = vacunaFormSchema.safeParse(values);
  if (result.success) return {};

  const errors: VacunaFormErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as keyof VacunaFormValues | undefined;
    if (field && !errors[field]) {
      errors[field] = issue.message;
    }
  }
  return errors;
}

function hoyISO(): string {
  return new Date().toISOString().split("T")[0];
}

export const EMPTY_VACUNA_FORM: VacunaFormValues = {
  nombre: "",
  fecha_aplicacion: hoyISO(),
  proxima_aplicacion: "",
  dosis: "",
  veterinario: "",
  observaciones: "",
};
