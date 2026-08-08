import { z } from "zod";

const resultadoValues = ["positivo", "negativo"] as const;

export const diagnosticoFormSchema = z.object({
  fecha: z
    .string()
    .trim()
    .min(1, "La fecha es obligatoria.")
    .refine((value) => new Date(value) <= new Date(), {
      message: "La fecha no puede ser una fecha futura.",
    }),
  resultado: z.enum(resultadoValues, { message: "Selecciona el resultado del diagnóstico." }),
  metodo: z.string().trim().max(120, "Máximo 120 caracteres.").optional().or(z.literal("")),
  veterinario: z.string().trim().max(120, "Máximo 120 caracteres.").optional().or(z.literal("")),
  observaciones: z.string().max(500, "Máximo 500 caracteres.").optional().or(z.literal("")),
});

export type DiagnosticoFormValues = z.infer<typeof diagnosticoFormSchema>;
export type DiagnosticoFormErrors = Partial<Record<keyof DiagnosticoFormValues, string>>;

export function validateDiagnosticoForm(values: DiagnosticoFormValues): DiagnosticoFormErrors {
  const result = diagnosticoFormSchema.safeParse(values);
  if (result.success) return {};

  const errors: DiagnosticoFormErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as keyof DiagnosticoFormValues | undefined;
    if (field && !errors[field]) errors[field] = issue.message;
  }
  return errors;
}

function hoyISO(): string {
  return new Date().toISOString().split("T")[0];
}

export const EMPTY_DIAGNOSTICO_FORM: DiagnosticoFormValues = {
  fecha: hoyISO(),
  resultado: "" as DiagnosticoFormValues["resultado"],
  metodo: "",
  veterinario: "",
  observaciones: "",
};
