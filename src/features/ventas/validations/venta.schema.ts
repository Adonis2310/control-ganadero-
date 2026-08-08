import { z } from "zod";
import type { TipoDetalleVenta } from "@/features/ventas/types";

const optionalNumeric = (label: string) =>
  z
    .string()
    .optional()
    .or(z.literal(""))
    .refine((value) => !value || (!Number.isNaN(Number(value)) && Number(value) >= 0), {
      message: `${label} debe ser un número válido mayor o igual a 0.`,
    });

export const ventaFormSchema = z.object({
  cliente_id: z.string().trim().min(1, "Selecciona un cliente."),
  fecha: z
    .string()
    .trim()
    .min(1, "La fecha es obligatoria.")
    .refine((value) => new Date(value) <= new Date(), {
      message: "La fecha no puede ser una fecha futura.",
    }),
  metodo_pago: z.string().optional().or(z.literal("")),
  descuento: optionalNumeric("El descuento"),
  impuestos: optionalNumeric("Los impuestos"),
  observaciones: z.string().max(500, "Máximo 500 caracteres.").optional().or(z.literal("")),
});

export type VentaFormValues = z.infer<typeof ventaFormSchema>;
export type VentaFormErrors = Partial<Record<keyof VentaFormValues, string>>;

export function validateVentaForm(values: VentaFormValues): VentaFormErrors {
  const result = ventaFormSchema.safeParse(values);
  if (result.success) return {};

  const errors: VentaFormErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as keyof VentaFormValues | undefined;
    if (field && !errors[field]) errors[field] = issue.message;
  }
  return errors;
}

function hoyISO(): string {
  return new Date().toISOString().split("T")[0];
}

export const EMPTY_VENTA_FORM: VentaFormValues = {
  cliente_id: "",
  fecha: hoyISO(),
  metodo_pago: "",
  descuento: "",
  impuestos: "",
  observaciones: "",
};

// ----------------------------------------------------------------------------
// Líneas de venta (animal / producto / otro)
// ----------------------------------------------------------------------------

export interface LineaVentaFormValues {
  tipo: TipoDetalleVenta;
  producto_id: string;
  animal_id: string;
  descripcion: string;
  cantidad: string;
  precio_unitario: string;
  descuento: string;
}

export const EMPTY_LINEA_VENTA_FORM: LineaVentaFormValues = {
  tipo: "animal",
  producto_id: "",
  animal_id: "",
  descripcion: "",
  cantidad: "1",
  precio_unitario: "",
  descuento: "0",
};

export interface LineaVentaFormErrors {
  animal_id?: string;
  producto_id?: string;
  descripcion?: string;
  cantidad?: string;
  precio_unitario?: string;
  descuento?: string;
}

export function validateLineaVenta(linea: LineaVentaFormValues): LineaVentaFormErrors {
  const errors: LineaVentaFormErrors = {};

  if (linea.tipo === "animal" && !linea.animal_id.trim()) {
    errors.animal_id = "Selecciona un animal.";
  }
  if (linea.tipo === "producto" && !linea.producto_id.trim()) {
    errors.producto_id = "Selecciona un producto.";
  }
  if (linea.tipo === "otro" && !linea.descripcion.trim()) {
    errors.descripcion = "Describe el elemento vendido.";
  }

  if (!linea.cantidad.trim() || Number.isNaN(Number(linea.cantidad)) || Number(linea.cantidad) <= 0) {
    errors.cantidad = "La cantidad debe ser mayor que 0.";
  }
  if (linea.tipo === "animal" && Number(linea.cantidad) !== 1) {
    errors.cantidad = "La cantidad de un animal debe ser 1.";
  }
  if (!linea.precio_unitario.trim() || Number.isNaN(Number(linea.precio_unitario)) || Number(linea.precio_unitario) < 0) {
    errors.precio_unitario = "El precio debe ser un número válido mayor o igual a 0.";
  }
  if (linea.descuento.trim() && (Number.isNaN(Number(linea.descuento)) || Number(linea.descuento) < 0)) {
    errors.descuento = "El descuento debe ser un número válido mayor o igual a 0.";
  }

  return errors;
}
