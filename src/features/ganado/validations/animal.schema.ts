import { z } from "zod";

const sexoValues = ["macho", "hembra"] as const;
const estadoValues = ["activo", "vendido", "fallecido", "transferido"] as const;

const optionalText = (max: number) =>
  z
    .string()
    .max(max, `Máximo ${max} caracteres.`)
    .optional()
    .or(z.literal(""));

const optionalNumeric = (label: string) =>
  z
    .string()
    .optional()
    .or(z.literal(""))
    .refine(
      (value) => !value || (!Number.isNaN(Number(value)) && Number(value) >= 0),
      { message: `${label} debe ser un número válido mayor o igual a 0.` },
    );

export const animalFormSchema = z.object({
  identificador: z
    .string()
    .trim()
    .min(1, "El número de arete es obligatorio.")
    .max(50, "Máximo 50 caracteres."),
  nombre: optionalText(100),
  sexo: z.enum(sexoValues, { message: "Selecciona el sexo del animal." }),
  raza_id: z.string().trim().min(1, "Selecciona una raza."),
  fecha_nacimiento: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine(
      (value) => !value || new Date(value) <= new Date(),
      { message: "La fecha de nacimiento no puede ser una fecha futura." },
    ),
  color: optionalText(50),
  peso_kg: optionalNumeric("El peso"),
  estado: z.enum(estadoValues, { message: "Selecciona un estado válido." }),
  padre_id: z.string().optional().or(z.literal("")),
  madre_id: z.string().optional().or(z.literal("")),
  observaciones: optionalText(1000),
});

export type AnimalFormValues = z.infer<typeof animalFormSchema>;

export type AnimalFormErrors = Partial<Record<keyof AnimalFormValues, string>>;

export function validateAnimalForm(values: AnimalFormValues): AnimalFormErrors {
  const result = animalFormSchema.safeParse(values);
  if (result.success) return {};

  const errors: AnimalFormErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as keyof AnimalFormValues | undefined;
    if (field && !errors[field]) {
      errors[field] = issue.message;
    }
  }
  return errors;
}

export const EMPTY_ANIMAL_FORM: AnimalFormValues = {
  identificador: "",
  nombre: "",
  sexo: "" as AnimalFormValues["sexo"],
  raza_id: "",
  fecha_nacimiento: "",
  color: "",
  peso_kg: "",
  estado: "activo",
  padre_id: "",
  madre_id: "",
  observaciones: "",
};
