"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CategorySelect } from "@/features/inventario/components/category-select";
import { UNIDAD_MEDIDA_OPTIONS, type CategoriaInventario, type ProductoInventario } from "@/features/inventario/types";
import {
  EMPTY_PRODUCTO_FORM,
  validateProductoForm,
  type ProductoFormErrors,
  type ProductoFormValues,
} from "@/features/inventario/validations/producto.schema";
import { createClient } from "@/lib/supabase/client";
import { inventarioService } from "@/services/inventario.service";
import { productosInventarioService } from "@/services/productos-inventario.service";

interface ProductFormProps {
  mode: "create" | "edit";
  categorias: CategoriaInventario[];
  producto?: ProductoInventario;
  /** Valor sugerido de stock mínimo (configurado en /configuracion) para productos nuevos. */
  stockMinimoDefault?: number;
}

function toFormValues(producto?: ProductoInventario, stockMinimoDefault?: number): ProductoFormValues {
  if (!producto) {
    return stockMinimoDefault !== undefined
      ? { ...EMPTY_PRODUCTO_FORM, stock_minimo: String(stockMinimoDefault) }
      : EMPTY_PRODUCTO_FORM;
  }
  return {
    nombre: producto.nombre,
    categoria_id: producto.categoria_id,
    descripcion: producto.descripcion ?? "",
    unidad_medida: producto.unidad_medida,
    stock_inicial: "",
    stock_minimo: String(producto.stock_minimo),
    costo_unitario: producto.costo_unitario?.toString() ?? "",
  };
}

export function ProductForm({ mode, categorias, producto, stockMinimoDefault }: ProductFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<ProductoFormValues>(() => toFormValues(producto, stockMinimoDefault));
  const [errors, setErrors] = useState<ProductoFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField<K extends keyof ProductoFormValues>(key: K, value: ProductoFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const fieldErrors = validateProductoForm(values);
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      toast.error("Revisa los campos marcados", {
        description: "Hay datos incompletos o inválidos en el formulario.",
      });
      return;
    }

    setIsSubmitting(true);
    const supabase = createClient();

    try {
      const payload = {
        nombre: values.nombre.trim(),
        categoria_id: values.categoria_id,
        descripcion: values.descripcion?.trim() || null,
        unidad_medida: values.unidad_medida,
        stock_minimo: Number(values.stock_minimo),
        costo_unitario: values.costo_unitario ? Number(values.costo_unitario) : null,
      };

      if (mode === "create") {
        const stockInicial = values.stock_inicial ? Number(values.stock_inicial) : null;
        const created = await inventarioService.crearProducto(supabase, payload, stockInicial);
        toast.success("Producto registrado", {
          description: `${values.nombre} se agregó al inventario.`,
        });
        router.push(`/inventario/${created.id}`);
        router.refresh();
        return;
      }

      if (!producto) return;
      await productosInventarioService.update(supabase, producto.id, payload);
      toast.success("Cambios guardados", {
        description: `Se actualizó la información de ${values.nombre}.`,
      });
      router.push(`/inventario/${producto.id}`);
      router.refresh();
    } catch {
      toast.error("No se pudo guardar el producto", {
        description: "Intenta nuevamente en unos segundos.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Información del producto</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="nombre">Nombre *</Label>
            <Input
              id="nombre"
              value={values.nombre}
              onChange={(event) => updateField("nombre", event.target.value)}
              placeholder="Ej. Ivermectina 1%"
              disabled={isSubmitting}
              aria-invalid={Boolean(errors.nombre)}
            />
            {errors.nombre && <p className="text-xs text-destructive">{errors.nombre}</p>}
          </div>

          <div className="space-y-2">
            <Label>Categoría *</Label>
            <CategorySelect
              value={values.categoria_id}
              onChange={(value) => updateField("categoria_id", value)}
              categorias={categorias}
              disabled={isSubmitting}
            />
            {errors.categoria_id && <p className="text-xs text-destructive">{errors.categoria_id}</p>}
          </div>

          <div className="space-y-2">
            <Label>Unidad de medida *</Label>
            <Select
              value={values.unidad_medida}
              onValueChange={(value) => updateField("unidad_medida", value ?? "")}
              disabled={isSubmitting}
            >
              <SelectTrigger className="w-full" aria-invalid={Boolean(errors.unidad_medida)}>
                <SelectValue placeholder="Selecciona una unidad">
                  {(current: string | null) => current ?? "Selecciona una unidad"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {UNIDAD_MEDIDA_OPTIONS.map((unidad) => (
                  <SelectItem key={unidad} value={unidad}>
                    {unidad}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.unidad_medida && <p className="text-xs text-destructive">{errors.unidad_medida}</p>}
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea
              id="descripcion"
              value={values.descripcion}
              onChange={(event) => updateField("descripcion", event.target.value)}
              placeholder="Notas sobre el producto..."
              disabled={isSubmitting}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Stock y costo</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          {mode === "create" ? (
            <div className="space-y-2">
              <Label htmlFor="stock_inicial">Stock inicial</Label>
              <Input
                id="stock_inicial"
                type="number"
                inputMode="decimal"
                min={0}
                step="0.01"
                value={values.stock_inicial}
                onChange={(event) => updateField("stock_inicial", event.target.value)}
                placeholder="Ej. 50"
                disabled={isSubmitting}
                aria-invalid={Boolean(errors.stock_inicial)}
              />
              {errors.stock_inicial && <p className="text-xs text-destructive">{errors.stock_inicial}</p>}
            </div>
          ) : (
            <div className="space-y-2">
              <Label>Stock actual</Label>
              <p className="flex h-8 items-center text-sm text-muted-foreground">
                Se gestiona con entradas, salidas y ajustes desde el detalle del producto.
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="stock_minimo">Stock mínimo *</Label>
            <Input
              id="stock_minimo"
              type="number"
              inputMode="decimal"
              min={0}
              step="0.01"
              value={values.stock_minimo}
              onChange={(event) => updateField("stock_minimo", event.target.value)}
              disabled={isSubmitting}
              aria-invalid={Boolean(errors.stock_minimo)}
            />
            {errors.stock_minimo && <p className="text-xs text-destructive">{errors.stock_minimo}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="costo_unitario">Costo unitario</Label>
            <Input
              id="costo_unitario"
              type="number"
              inputMode="decimal"
              min={0}
              step="0.01"
              value={values.costo_unitario}
              onChange={(event) => updateField("costo_unitario", event.target.value)}
              placeholder="Ej. 12.50"
              disabled={isSubmitting}
              aria-invalid={Boolean(errors.costo_unitario)}
            />
            {errors.costo_unitario && <p className="text-xs text-destructive">{errors.costo_unitario}</p>}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" disabled={isSubmitting} onClick={() => router.back()}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="size-4 animate-spin" />}
          {mode === "create" ? "Registrar producto" : "Guardar cambios"}
        </Button>
      </div>
    </form>
  );
}
