import { z } from "zod";

export const desparasitacionFormSchema = z
  .object({
    producto: z.string().trim().min(1, "El producto es obligatorio.").max(120),
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

export type DesparasitacionFormValues = z.infer<typeof desparasitacionFormSchema>;
export type DesparasitacionFormErrors = Partial<Record<keyof DesparasitacionFormValues, string>>;

export function validateDesparasitacionForm(
  values: DesparasitacionFormValues,
): DesparasitacionFormErrors {
  const result = desparasitacionFormSchema.safeParse(values);
  if (result.success) return {};

  const errors: DesparasitacionFormErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as keyof DesparasitacionFormValues | undefined;
    if (field && !errors[field]) {
      errors[field] = issue.message;
    }
  }
  return errors;
}

function hoyISO(): string {
  return new Date().toISOString().split("T")[0];
}

export const EMPTY_DESPARASITACION_FORM: DesparasitacionFormValues = {
  producto: "",
  fecha_aplicacion: hoyISO(),
  proxima_aplicacion: "",
  dosis: "",
  veterinario: "",
  observaciones: "",
};
