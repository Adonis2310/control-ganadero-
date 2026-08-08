import { z } from "zod";

export const inseminacionFormSchema = z.object({
  fecha: z
    .string()
    .trim()
    .min(1, "La fecha es obligatoria.")
    .refine((value) => new Date(value) <= new Date(), {
      message: "La fecha no puede ser una fecha futura.",
    }),
  metodo: z.string().trim().max(120, "Máximo 120 caracteres.").optional().or(z.literal("")),
  identificacion_semen: z
    .string()
    .trim()
    .max(120, "Máximo 120 caracteres.")
    .optional()
    .or(z.literal("")),
  macho_id: z.string().optional().or(z.literal("")),
  tecnico: z.string().trim().max(120, "Máximo 120 caracteres.").optional().or(z.literal("")),
  observaciones: z.string().max(500, "Máximo 500 caracteres.").optional().or(z.literal("")),
});

export type InseminacionFormValues = z.infer<typeof inseminacionFormSchema>;
export type InseminacionFormErrors = Partial<Record<keyof InseminacionFormValues, string>>;

export function validateInseminacionForm(values: InseminacionFormValues): InseminacionFormErrors {
  const result = inseminacionFormSchema.safeParse(values);
  if (result.success) return {};

  const errors: InseminacionFormErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as keyof InseminacionFormValues | undefined;
    if (field && !errors[field]) errors[field] = issue.message;
  }
  return errors;
}

function hoyISO(): string {
  return new Date().toISOString().split("T")[0];
}

export const EMPTY_INSEMINACION_FORM: InseminacionFormValues = {
  fecha: hoyISO(),
  metodo: "",
  identificacion_semen: "",
  macho_id: "",
  tecnico: "",
  observaciones: "",
};
