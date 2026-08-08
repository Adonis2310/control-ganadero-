import { z } from "zod";

function hoyISO(): string {
  return new Date().toISOString().split("T")[0];
}

export const gastoFormSchema = z.object({
  categoria_id: z.string().trim().min(1, "Selecciona una categoría."),
  descripcion: z.string().trim().min(1, "La descripción es obligatoria.").max(300, "Máximo 300 caracteres."),
  monto: z
    .string()
    .trim()
    .min(1, "El monto es obligatorio.")
    .refine((value) => !Number.isNaN(Number(value)) && Number(value) > 0, {
      message: "El monto debe ser un número mayor que 0.",
    }),
  fecha: z
    .string()
    .trim()
    .min(1, "La fecha es obligatoria.")
    .refine((value) => new Date(value) <= new Date(), {
      message: "La fecha no puede ser una fecha futura.",
    }),
  metodo_pago: z.string().optional().or(z.literal("")),
  proveedor_id: z.string().optional().or(z.literal("")),
  animal_id: z.string().optional().or(z.literal("")),
  observaciones: z.string().max(500, "Máximo 500 caracteres.").optional().or(z.literal("")),
});

export type GastoFormValues = z.infer<typeof gastoFormSchema>;
export type GastoFormErrors = Partial<Record<keyof GastoFormValues, string>>;

export function validateGastoForm(values: GastoFormValues): GastoFormErrors {
  const result = gastoFormSchema.safeParse(values);
  if (result.success) return {};

  const errors: GastoFormErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as keyof GastoFormValues | undefined;
    if (field && !errors[field]) errors[field] = issue.message;
  }
  return errors;
}

export const EMPTY_GASTO_FORM: GastoFormValues = {
  categoria_id: "",
  descripcion: "",
  monto: "",
  fecha: hoyISO(),
  metodo_pago: "",
  proveedor_id: "",
  animal_id: "",
  observaciones: "",
};
