import { z } from "zod";

const estadoPartoValues = ["normal", "complicaciones"] as const;

export const partoFormSchema = z.object({
  fecha: z
    .string()
    .trim()
    .min(1, "La fecha es obligatoria.")
    .refine((value) => new Date(value) <= new Date(), {
      message: "La fecha no puede ser una fecha futura.",
    }),
  numero_crias: z
    .string()
    .trim()
    .min(1, "Indica el número de crías.")
    .refine((value) => Number.isInteger(Number(value)) && Number(value) > 0, {
      message: "El número de crías debe ser un entero mayor que 0.",
    }),
  estado_parto: z.enum(estadoPartoValues, { message: "Selecciona el estado del parto." }),
  observaciones: z.string().max(500, "Máximo 500 caracteres.").optional().or(z.literal("")),
});

export type PartoFormValues = z.infer<typeof partoFormSchema>;
export type PartoFormErrors = Partial<Record<keyof PartoFormValues, string>>;

export function validatePartoForm(values: PartoFormValues): PartoFormErrors {
  const result = partoFormSchema.safeParse(values);
  if (result.success) return {};

  const errors: PartoFormErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as keyof PartoFormValues | undefined;
    if (field && !errors[field]) errors[field] = issue.message;
  }
  return errors;
}

function hoyISO(): string {
  return new Date().toISOString().split("T")[0];
}

export const EMPTY_PARTO_FORM: PartoFormValues = {
  fecha: hoyISO(),
  numero_crias: "1",
  estado_parto: "normal",
  observaciones: "",
};
