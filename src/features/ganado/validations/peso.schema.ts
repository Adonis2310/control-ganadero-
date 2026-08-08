import { z } from "zod";

export const pesoFormSchema = z.object({
  fecha: z
    .string()
    .trim()
    .min(1, "La fecha es obligatoria.")
    .refine((value) => new Date(value) <= new Date(), {
      message: "La fecha no puede ser una fecha futura.",
    }),
  peso: z
    .string()
    .trim()
    .min(1, "El peso es obligatorio.")
    .refine((value) => !Number.isNaN(Number(value)), {
      message: "El peso debe ser un número válido.",
    })
    .refine((value) => Number(value) > 0, {
      message: "El peso debe ser mayor que 0.",
    }),
  observaciones: z.string().max(500, "Máximo 500 caracteres.").optional().or(z.literal("")),
});

export type PesoFormValues = z.infer<typeof pesoFormSchema>;
export type PesoFormErrors = Partial<Record<keyof PesoFormValues, string>>;

export function validatePesoForm(values: PesoFormValues): PesoFormErrors {
  const result = pesoFormSchema.safeParse(values);
  if (result.success) return {};

  const errors: PesoFormErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as keyof PesoFormValues | undefined;
    if (field && !errors[field]) {
      errors[field] = issue.message;
    }
  }
  return errors;
}

function hoyISO(): string {
  return new Date().toISOString().split("T")[0];
}

export const EMPTY_PESO_FORM: PesoFormValues = {
  fecha: hoyISO(),
  peso: "",
  observaciones: "",
};
