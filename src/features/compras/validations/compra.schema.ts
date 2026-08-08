import { z } from "zod";

const optionalNumeric = (label: string) =>
  z
    .string()
    .optional()
    .or(z.literal(""))
    .refine((value) => !value || (!Number.isNaN(Number(value)) && Number(value) >= 0), {
      message: `${label} debe ser un número válido mayor o igual a 0.`,
    });

export const compraFormSchema = z.object({
  proveedor_id: z.string().trim().min(1, "Selecciona un proveedor."),
  fecha: z
    .string()
    .trim()
    .min(1, "La fecha es obligatoria.")
    .refine((value) => new Date(value) <= new Date(), {
      message: "La fecha no puede ser una fecha futura.",
    }),
  descuento: optionalNumeric("El descuento"),
  impuestos: optionalNumeric("Los impuestos"),
  observaciones: z.string().max(500, "Máximo 500 caracteres.").optional().or(z.literal("")),
});

export type CompraFormValues = z.infer<typeof compraFormSchema>;
export type CompraFormErrors = Partial<Record<keyof CompraFormValues, string>>;

export function validateCompraForm(values: CompraFormValues): CompraFormErrors {
  const result = compraFormSchema.safeParse(values);
  if (result.success) return {};

  const errors: CompraFormErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as keyof CompraFormValues | undefined;
    if (field && !errors[field]) errors[field] = issue.message;
  }
  return errors;
}

function hoyISO(): string {
  return new Date().toISOString().split("T")[0];
}

export const EMPTY_COMPRA_FORM: CompraFormValues = {
  proveedor_id: "",
  fecha: hoyISO(),
  descuento: "",
  impuestos: "",
  observaciones: "",
};

// ----------------------------------------------------------------------------
// Líneas de producto
// ----------------------------------------------------------------------------

export interface LineaFormValues {
  producto_id: string;
  cantidad: string;
  costo_unitario: string;
  descuento: string;
}

export const EMPTY_LINEA_FORM: LineaFormValues = {
  producto_id: "",
  cantidad: "1",
  costo_unitario: "",
  descuento: "0",
};

export interface LineaFormErrors {
  producto_id?: string;
  cantidad?: string;
  costo_unitario?: string;
  descuento?: string;
}

export function validateLinea(linea: LineaFormValues): LineaFormErrors {
  const errors: LineaFormErrors = {};
  if (!linea.producto_id.trim()) errors.producto_id = "Selecciona un producto.";
  if (!linea.cantidad.trim() || Number.isNaN(Number(linea.cantidad)) || Number(linea.cantidad) <= 0) {
    errors.cantidad = "La cantidad debe ser mayor que 0.";
  }
  if (!linea.costo_unitario.trim() || Number.isNaN(Number(linea.costo_unitario)) || Number(linea.costo_unitario) < 0) {
    errors.costo_unitario = "El costo unitario debe ser un número válido mayor o igual a 0.";
  }
  if (linea.descuento.trim() && (Number.isNaN(Number(linea.descuento)) || Number(linea.descuento) < 0)) {
    errors.descuento = "El descuento debe ser un número válido mayor o igual a 0.";
  }
  return errors;
}
