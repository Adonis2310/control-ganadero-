import { z } from "zod";

import { DEFAULT_FARM_NAME, type FincaRow } from "@/features/configuracion/types";

const TELEFONO_REGEX = /^[0-9+\-()\s]+$/;

export const fincaInfoFormSchema = z.object({
  nombre: z.string().trim().min(1, "El nombre de la finca es obligatorio.").max(150, "Máximo 150 caracteres."),
  propietario: z.string().max(150, "Máximo 150 caracteres.").optional().or(z.literal("")),
  telefono: z
    .string()
    .max(30, "Máximo 30 caracteres.")
    .optional()
    .or(z.literal(""))
    .refine((value) => !value || TELEFONO_REGEX.test(value), {
      message: "El teléfono solo puede tener números y caracteres comunes (+, -, espacios, paréntesis).",
    }),
  correo: z
    .string()
    .max(150, "Máximo 150 caracteres.")
    .optional()
    .or(z.literal(""))
    .refine((value) => !value || z.string().email().safeParse(value).success, {
      message: "Ingresa un correo electrónico válido.",
    }),
  direccion: z.string().max(300, "Máximo 300 caracteres.").optional().or(z.literal("")),
  provincia: z.string().max(100, "Máximo 100 caracteres.").optional().or(z.literal("")),
  canton: z.string().max(100, "Máximo 100 caracteres.").optional().or(z.literal("")),
  distrito: z.string().max(100, "Máximo 100 caracteres.").optional().or(z.literal("")),
  descripcion: z.string().max(500, "Máximo 500 caracteres.").optional().or(z.literal("")),
});

export type FincaInfoFormValues = z.infer<typeof fincaInfoFormSchema>;
export type FincaInfoFormErrors = Partial<Record<keyof FincaInfoFormValues, string>>;

export function validateFincaInfoForm(values: FincaInfoFormValues): FincaInfoFormErrors {
  const result = fincaInfoFormSchema.safeParse(values);
  if (result.success) return {};

  const errors: FincaInfoFormErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as keyof FincaInfoFormValues | undefined;
    if (field && !errors[field]) errors[field] = issue.message;
  }
  return errors;
}

export function fincaToFormValues(finca: FincaRow | null): FincaInfoFormValues {
  if (!finca) {
    return {
      nombre: DEFAULT_FARM_NAME,
      propietario: "",
      telefono: "",
      correo: "",
      direccion: "",
      provincia: "",
      canton: "",
      distrito: "",
      descripcion: "",
    };
  }
  return {
    nombre: finca.nombre,
    propietario: finca.propietario ?? "",
    telefono: finca.telefono ?? "",
    correo: finca.correo ?? "",
    direccion: finca.direccion ?? "",
    provincia: finca.provincia ?? "",
    canton: finca.canton ?? "",
    distrito: finca.distrito ?? "",
    descripcion: finca.descripcion ?? "",
  };
}
