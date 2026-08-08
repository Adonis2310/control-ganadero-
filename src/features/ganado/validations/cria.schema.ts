import { z } from "zod";

const sexoValues = ["macho", "hembra"] as const;

const optionalNumeric = (label: string) =>
  z
    .string()
    .optional()
    .or(z.literal(""))
    .refine((value) => !value || (!Number.isNaN(Number(value)) && Number(value) >= 0), {
      message: `${label} debe ser un número válido mayor o igual a 0.`,
    });

export const criaFormSchema = z.object({
  identificador: z
    .string()
    .trim()
    .min(1, "El número de arete es obligatorio.")
    .max(50, "Máximo 50 caracteres."),
  nombre: z.string().max(100, "Máximo 100 caracteres.").optional().or(z.literal("")),
  sexo: z.enum(sexoValues, { message: "Selecciona el sexo de la cría." }),
  raza_id: z.string().trim().min(1, "Selecciona una raza."),
  fecha_nacimiento: z
    .string()
    .trim()
    .min(1, "La fecha de nacimiento es obligatoria.")
    .refine((value) => new Date(value) <= new Date(), {
      message: "La fecha de nacimiento no puede ser una fecha futura.",
    }),
  peso_nacimiento_kg: optionalNumeric("El peso"),
  color: z.string().max(50, "Máximo 50 caracteres.").optional().or(z.literal("")),
  observaciones: z.string().max(500, "Máximo 500 caracteres.").optional().or(z.literal("")),
});

export type CriaFormValues = z.infer<typeof criaFormSchema>;
export type CriaFormErrors = Partial<Record<keyof CriaFormValues, string>>;

export function validateCriaForm(values: CriaFormValues): CriaFormErrors {
  const result = criaFormSchema.safeParse(values);
  if (result.success) return {};

  const errors: CriaFormErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as keyof CriaFormValues | undefined;
    if (field && !errors[field]) errors[field] = issue.message;
  }
  return errors;
}

export function emptyCriaForm(fechaNacimiento: string): CriaFormValues {
  return {
    identificador: "",
    nombre: "",
    sexo: "" as CriaFormValues["sexo"],
    raza_id: "",
    fecha_nacimiento: fechaNacimiento,
    peso_nacimiento_kg: "",
    color: "",
    observaciones: "",
  };
}
