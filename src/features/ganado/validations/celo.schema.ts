import { z } from "zod";

export const celoFormSchema = z.object({
  fecha: z
    .string()
    .trim()
    .min(1, "La fecha es obligatoria.")
    .refine((value) => new Date(value) <= new Date(), {
      message: "La fecha no puede ser una fecha futura.",
    }),
  observaciones: z.string().max(500, "Máximo 500 caracteres.").optional().or(z.literal("")),
});

export type CeloFormValues = z.infer<typeof celoFormSchema>;
export type CeloFormErrors = Partial<Record<keyof CeloFormValues, string>>;

export function validateCeloForm(values: CeloFormValues): CeloFormErrors {
  const result = celoFormSchema.safeParse(values);
  if (result.success) return {};

  const errors: CeloFormErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as keyof CeloFormValues | undefined;
    if (field && !errors[field]) errors[field] = issue.message;
  }
  return errors;
}

function hoyISO(): string {
  return new Date().toISOString().split("T")[0];
}

export const EMPTY_CELO_FORM: CeloFormValues = {
  fecha: hoyISO(),
  observaciones: "",
};
