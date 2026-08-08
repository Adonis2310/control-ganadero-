import { z } from "zod";

const tipoMontaValues = ["natural", "controlada"] as const;

export const montaFormSchema = z.object({
  fecha: z
    .string()
    .trim()
    .min(1, "La fecha es obligatoria.")
    .refine((value) => new Date(value) <= new Date(), {
      message: "La fecha no puede ser una fecha futura.",
    }),
  macho_id: z.string().trim().min(1, "Selecciona el macho."),
  tipo_monta: z.enum(tipoMontaValues, { message: "Selecciona el tipo de monta." }),
  observaciones: z.string().max(500, "Máximo 500 caracteres.").optional().or(z.literal("")),
});

export type MontaFormValues = z.infer<typeof montaFormSchema>;
export type MontaFormErrors = Partial<Record<keyof MontaFormValues, string>>;

export function validateMontaForm(values: MontaFormValues): MontaFormErrors {
  const result = montaFormSchema.safeParse(values);
  if (result.success) return {};

  const errors: MontaFormErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as keyof MontaFormValues | undefined;
    if (field && !errors[field]) errors[field] = issue.message;
  }
  return errors;
}

function hoyISO(): string {
  return new Date().toISOString().split("T")[0];
}

export const EMPTY_MONTA_FORM: MontaFormValues = {
  fecha: hoyISO(),
  macho_id: "",
  tipo_monta: "" as MontaFormValues["tipo_monta"],
  observaciones: "",
};
