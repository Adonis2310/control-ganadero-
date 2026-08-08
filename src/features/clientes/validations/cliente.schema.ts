import { z } from "zod";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TELEFONO_REGEX = /^[0-9+()\s-]{6,25}$/;

const optionalText = (max: number) => z.string().max(max, `Máximo ${max} caracteres.`).optional().or(z.literal(""));

export const clienteFormSchema = z.object({
  nombre: z.string().trim().min(1, "El nombre es obligatorio.").max(150, "Máximo 150 caracteres."),
  identificacion: optionalText(50),
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
  notas: optionalText(1000),
});

export type ClienteFormValues = z.infer<typeof clienteFormSchema>;
export type ClienteFormErrors = Partial<Record<keyof ClienteFormValues, string>>;

export function validateClienteForm(values: ClienteFormValues): ClienteFormErrors {
  const result = clienteFormSchema.safeParse(values);
  if (result.success) return {};

  const errors: ClienteFormErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as keyof ClienteFormValues | undefined;
    if (field && !errors[field]) errors[field] = issue.message;
  }
  return errors;
}

export const EMPTY_CLIENTE_FORM: ClienteFormValues = {
  nombre: "",
  identificacion: "",
  telefono: "",
  correo: "",
  direccion: "",
  notas: "",
};
