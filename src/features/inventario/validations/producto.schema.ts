import { z } from "zod";

const optionalNumeric = (label: string) =>
  z
    .string()
    .optional()
    .or(z.literal(""))
    .refine((value) => !value || (!Number.isNaN(Number(value)) && Number(value) >= 0), {
      message: `${label} debe ser un número válido mayor o igual a 0.`,
    });

export const productoFormSchema = z.object({
  nombre: z.string().trim().min(1, "El nombre es obligatorio.").max(150, "Máximo 150 caracteres."),
  categoria_id: z.string().trim().min(1, "Selecciona una categoría."),
  descripcion: z.string().max(500, "Máximo 500 caracteres.").optional().or(z.literal("")),
  unidad_medida: z.string().trim().min(1, "Selecciona una unidad de medida."),
  stock_inicial: optionalNumeric("El stock inicial"),
  stock_minimo: z
    .string()
    .trim()
    .min(1, "El stock mínimo es obligatorio.")
    .refine((value) => !Number.isNaN(Number(value)) && Number(value) >= 0, {
      message: "El stock mínimo debe ser un número válido mayor o igual a 0.",
    }),
  costo_unitario: optionalNumeric("El costo unitario"),
});

export type ProductoFormValues = z.infer<typeof productoFormSchema>;
export type ProductoFormErrors = Partial<Record<keyof ProductoFormValues, string>>;

export function validateProductoForm(values: ProductoFormValues): ProductoFormErrors {
  const result = productoFormSchema.safeParse(values);
  if (result.success) return {};

  const errors: ProductoFormErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as keyof ProductoFormValues | undefined;
    if (field && !errors[field]) errors[field] = issue.message;
  }
  return errors;
}

export const EMPTY_PRODUCTO_FORM: ProductoFormValues = {
  nombre: "",
  categoria_id: "",
  descripcion: "",
  unidad_medida: "",
  stock_inicial: "",
  stock_minimo: "0",
  costo_unitario: "",
};
