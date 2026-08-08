"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ClienteRow } from "@/features/clientes/types";
import {
  EMPTY_CLIENTE_FORM,
  validateClienteForm,
  type ClienteFormErrors,
  type ClienteFormValues,
} from "@/features/clientes/validations/cliente.schema";
import { createClient } from "@/lib/supabase/client";
import { clientesService } from "@/services/clientes.service";

interface ClientFormProps {
  mode: "create" | "edit";
  cliente?: ClienteRow;
}

function toFormValues(cliente?: ClienteRow): ClienteFormValues {
  if (!cliente) return EMPTY_CLIENTE_FORM;
  return {
    nombre: cliente.nombre,
    identificacion: cliente.identificacion ?? "",
    telefono: cliente.telefono ?? "",
    correo: cliente.correo ?? "",
    direccion: cliente.direccion ?? "",
    notas: cliente.notas ?? "",
  };
}

export function ClientForm({ mode, cliente }: ClientFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<ClienteFormValues>(() => toFormValues(cliente));
  const [errors, setErrors] = useState<ClienteFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField<K extends keyof ClienteFormValues>(key: K, value: ClienteFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const fieldErrors = validateClienteForm(values);
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
        identificacion: values.identificacion?.trim() || null,
        telefono: values.telefono?.trim() || null,
        correo: values.correo?.trim() || null,
        direccion: values.direccion?.trim() || null,
        notas: values.notas?.trim() || null,
      };

      if (mode === "create") {
        const created = await clientesService.create(supabase, payload);
        toast.success("Cliente registrado", { description: `${values.nombre} se agregó correctamente.` });
        router.push(`/clientes/${created.id}`);
        router.refresh();
        return;
      }

      if (!cliente) return;
      await clientesService.update(supabase, cliente.id, payload);
      toast.success("Cambios guardados", { description: `Se actualizó la información de ${values.nombre}.` });
      router.push(`/clientes/${cliente.id}`);
      router.refresh();
    } catch {
      toast.error("No se pudo guardar el cliente", { description: "Intenta nuevamente en unos segundos." });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Información del cliente</CardTitle>
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
            <Label htmlFor="identificacion">Identificación</Label>
            <Input
              id="identificacion"
              value={values.identificacion}
              onChange={(event) => updateField("identificacion", event.target.value)}
              placeholder="Cédula, RUC, etc. (opcional)"
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
              placeholder="Ej. cliente@correo.com"
              disabled={isSubmitting}
              aria-invalid={Boolean(errors.correo)}
            />
            {errors.correo && <p className="text-xs text-destructive">{errors.correo}</p>}
          </div>

          <div className="space-y-2 sm:col-span-2">
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
              placeholder="Notas adicionales sobre este cliente..."
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
          {mode === "create" ? "Registrar cliente" : "Guardar cambios"}
        </Button>
      </div>
    </form>
  );
}
