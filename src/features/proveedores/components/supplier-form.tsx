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
import { TIPO_PROVEEDOR_OPTIONS, type ProveedorRow } from "@/features/proveedores/types";
import {
  EMPTY_PROVEEDOR_FORM,
  validateProveedorForm,
  type ProveedorFormErrors,
  type ProveedorFormValues,
} from "@/features/proveedores/validations/proveedor.schema";
import { createClient } from "@/lib/supabase/client";
import { proveedoresService } from "@/services/proveedores.service";

interface SupplierFormProps {
  mode: "create" | "edit";
  proveedor?: ProveedorRow;
}

function toFormValues(proveedor?: ProveedorRow): ProveedorFormValues {
  if (!proveedor) return EMPTY_PROVEEDOR_FORM;
  return {
    nombre: proveedor.nombre,
    empresa: proveedor.empresa ?? "",
    telefono: proveedor.telefono ?? "",
    correo: proveedor.correo ?? "",
    direccion: proveedor.direccion ?? "",
    tipo: proveedor.tipo ?? "",
    notas: proveedor.notas ?? "",
  };
}

export function SupplierForm({ mode, proveedor }: SupplierFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<ProveedorFormValues>(() => toFormValues(proveedor));
  const [errors, setErrors] = useState<ProveedorFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField<K extends keyof ProveedorFormValues>(key: K, value: ProveedorFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const fieldErrors = validateProveedorForm(values);
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
        empresa: values.empresa?.trim() || null,
        telefono: values.telefono?.trim() || null,
        correo: values.correo?.trim() || null,
        direccion: values.direccion?.trim() || null,
        tipo: values.tipo || null,
        notas: values.notas?.trim() || null,
      };

      if (mode === "create") {
        const created = await proveedoresService.create(supabase, payload);
        toast.success("Proveedor registrado", { description: `${values.nombre} se agregó correctamente.` });
        router.push(`/proveedores/${created.id}`);
        router.refresh();
        return;
      }

      if (!proveedor) return;
      await proveedoresService.update(supabase, proveedor.id, payload);
      toast.success("Cambios guardados", { description: `Se actualizó la información de ${values.nombre}.` });
      router.push(`/proveedores/${proveedor.id}`);
      router.refresh();
    } catch {
      toast.error("No se pudo guardar el proveedor", { description: "Intenta nuevamente en unos segundos." });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Información del proveedor</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre *</Label>
            <Input
              id="nombre"
              value={values.nombre}
              onChange={(event) => updateField("nombre", event.target.value)}
              placeholder="Ej. Juan Pérez"
              disabled={isSubmitting}
              aria-invalid={Boolean(errors.nombre)}
            />
            {errors.nombre && <p className="text-xs text-destructive">{errors.nombre}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="empresa">Empresa</Label>
            <Input
              id="empresa"
              value={values.empresa}
              onChange={(event) => updateField("empresa", event.target.value)}
              placeholder="Ej. Agroservicio XYZ"
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="telefono">Teléfono</Label>
            <Input
              id="telefono"
              value={values.telefono}
              onChange={(event) => updateField("telefono", event.target.value)}
              placeholder="Ej. 8888-8888"
              disabled={isSubmitting}
              aria-invalid={Boolean(errors.telefono)}
            />
            {errors.telefono && <p className="text-xs text-destructive">{errors.telefono}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="correo">Correo</Label>
            <Input
              id="correo"
              type="email"
              value={values.correo}
              onChange={(event) => updateField("correo", event.target.value)}
              placeholder="Ej. contacto@proveedor.com"
              disabled={isSubmitting}
              aria-invalid={Boolean(errors.correo)}
            />
            {errors.correo && <p className="text-xs text-destructive">{errors.correo}</p>}
          </div>

          <div className="space-y-2">
            <Label>Tipo</Label>
            <Select
              value={values.tipo}
              onValueChange={(value) => updateField("tipo", value ?? "")}
              disabled={isSubmitting}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecciona un tipo">
                  {(current: string | null) => current || "Selecciona un tipo"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {TIPO_PROVEEDOR_OPTIONS.map((tipo) => (
                  <SelectItem key={tipo} value={tipo}>
                    {tipo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="direccion">Dirección</Label>
            <Input
              id="direccion"
              value={values.direccion}
              onChange={(event) => updateField("direccion", event.target.value)}
              placeholder="Ej. San José, Costa Rica"
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="notas">Notas</Label>
            <Textarea
              id="notas"
              value={values.notas}
              onChange={(event) => updateField("notas", event.target.value)}
              placeholder="Notas adicionales sobre este proveedor..."
              disabled={isSubmitting}
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" disabled={isSubmitting} onClick={() => router.back()}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="size-4 animate-spin" />}
          {mode === "create" ? "Registrar proveedor" : "Guardar cambios"}
        </Button>
      </div>
    </form>
  );
}
