import { z } from "zod";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TELEFONO_REGEX = /^[0-9+()\s-]{6,25}$/;

const optionalText = (max: number) => z.string().max(max, `Máximo ${max} caracteres.`).optional().or(z.literal(""));

export const proveedorFormSchema = z.object({
  nombre: z.string().trim().min(1, "El nombre es obligatorio.").max(150, "Máximo 150 caracteres."),
  empresa: optionalText(150),
  telefono: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine((value) => !value || TELEFONO_REGEX.test(value), {
      message: "Ingresa un teléfono válido.",
    }),
  correo: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine((value) => !value || EMAIL_REGEX.test(value), {
      message: "Ingresa un correo electrónico válido.",
    }),
  direccion: optionalText(300),
  tipo: z.string().optional().or(z.literal("")),
  notas: optionalText(1000),
});

export type ProveedorFormValues = z.infer<typeof proveedorFormSchema>;
export type ProveedorFormErrors = Partial<Record<keyof ProveedorFormValues, string>>;

export function validateProveedorForm(values: ProveedorFormValues): ProveedorFormErrors {
  const result = proveedorFormSchema.safeParse(values);
  if (result.success) return {};

  const errors: ProveedorFormErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as keyof ProveedorFormValues | undefined;
    if (field && !errors[field]) errors[field] = issue.message;
  }
  return errors;
}

export const EMPTY_PROVEEDOR_FORM: ProveedorFormValues = {
  nombre: "",
  empresa: "",
  telefono: "",
  correo: "",
  direccion: "",
  tipo: "",
  notas: "",
};
