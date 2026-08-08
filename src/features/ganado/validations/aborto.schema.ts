import { z } from "zod";

export const abortoFormSchema = z.object({
  fecha: z
    .string()
    .trim()
    .min(1, "La fecha es obligatoria.")
    .refine((value) => new Date(value) <= new Date(), {
      message: "La fecha no puede ser una fecha futura.",
    }),
  gestacion_id: z.string().optional().or(z.literal("")),
  motivo: z.string().trim().max(300, "Máximo 300 caracteres.").optional().or(z.literal("")),
  veterinario: z.string().trim().max(120, "Máximo 120 caracteres.").optional().or(z.literal("")),
  observaciones: z.string().max(500, "Máximo 500 caracteres.").optional().or(z.literal("")),
});

export type AbortoFormValues = z.infer<typeof abortoFormSchema>;
export type AbortoFormErrors = Partial<Record<keyof AbortoFormValues, string>>;

export function validateAbortoForm(values: AbortoFormValues): AbortoFormErrors {
  const result = abortoFormSchema.safeParse(values);
  if (result.success) return {};

  const errors: AbortoFormErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as keyof AbortoFormValues | undefined;
    if (field && !errors[field]) errors[field] = issue.message;
  }
  return errors;
}

function hoyISO(): string {
  return new Date().toISOString().split("T")[0];
}

export const EMPTY_ABORTO_FORM: AbortoFormValues = {
  fecha: hoyISO(),
  gestacion_id: "",
  motivo: "",
  veterinario: "",
  observaciones: "",
};
