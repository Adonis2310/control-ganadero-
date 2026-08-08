"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { DesparasitacionRow } from "@/features/ganado/types";
import {
  EMPTY_DESPARASITACION_FORM,
  validateDesparasitacionForm,
  type DesparasitacionFormErrors,
  type DesparasitacionFormValues,
} from "@/features/ganado/validations/desparasitacion.schema";
import { createClient } from "@/lib/supabase/client";
import { desparasitacionesService } from "@/services/desparasitaciones.service";

interface DewormingFormDialogProps {
  animalId: string;
  desparasitacion: DesparasitacionRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

function toFormValues(item: DesparasitacionRow | null): DesparasitacionFormValues {
  if (!item) return EMPTY_DESPARASITACION_FORM;
  return {
    producto: item.producto,
    fecha_aplicacion: item.fecha_aplicacion,
    proxima_aplicacion: item.proxima_aplicacion ?? "",
    dosis: item.dosis ?? "",
    veterinario: item.veterinario ?? "",
    observaciones: item.observaciones ?? "",
  };
}

export function DewormingFormDialog({
  animalId,
  desparasitacion,
  open,
  onOpenChange,
  onSaved,
}: DewormingFormDialogProps) {
  const [values, setValues] = useState<DesparasitacionFormValues>(() =>
    toFormValues(desparasitacion),
  );
  const [errors, setErrors] = useState<DesparasitacionFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEdit = desparasitacion !== null;

  useEffect(() => {
    if (open) {
      setValues(toFormValues(desparasitacion));
      setErrors({});
    }
  }, [open, desparasitacion]);

  function updateField<K extends keyof DesparasitacionFormValues>(
    key: K,
    value: DesparasitacionFormValues[K],
  ) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const fieldErrors = validateDesparasitacionForm(values);
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    const supabase = createClient();

    try {
      const payload = {
        animal_id: animalId,
        producto: values.producto.trim(),
        fecha_aplicacion: values.fecha_aplicacion,
        proxima_aplicacion: values.proxima_aplicacion?.trim() || null,
        dosis: values.dosis?.trim() || null,
        veterinario: values.veterinario?.trim() || null,
        observaciones: values.observaciones?.trim() || null,
      };

      if (isEdit) {
        await desparasitacionesService.update(supabase, desparasitacion.id, payload);
        toast.success("Desparasitación actualizada", { description: "Se guardaron los cambios." });
      } else {
        await desparasitacionesService.create(supabase, payload);
        toast.success("Desparasitación registrada", {
          description: `Se registró "${values.producto}".`,
        });
      }

      onSaved();
      onOpenChange(false);
    } catch {
      toast.error("No se pudo guardar la desparasitación", {
        description: "Intenta nuevamente en unos segundos.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEdit ? "Editar desparasitación" : "Registrar desparasitación"}</DialogTitle>
            <DialogDescription>
              {isEdit
                ? "Actualiza los datos de este registro."
                : "Agrega una nueva desparasitación al historial del animal."}
            </DialogDescription>
          </DialogHeader>

          <div className="flex max-h-[60vh] flex-col gap-4 overflow-y-auto px-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="desparasitacion-producto">Producto *</Label>
              <Input
                id="desparasitacion-producto"
                value={values.producto}
                onChange={(event) => updateField("producto", event.target.value)}
                placeholder="Ej. Ivermectina"
                disabled={isSubmitting}
                aria-invalid={Boolean(errors.producto)}
              />
              {errors.producto && <p className="text-xs text-destructive">{errors.producto}</p>}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="desparasitacion-fecha">Fecha de aplicación *</Label>
                <Input
                  id="desparasitacion-fecha"
                  type="date"
                  value={values.fecha_aplicacion}
                  max={new Date().toISOString().split("T")[0]}
                  onChange={(event) => updateField("fecha_aplicacion", event.target.value)}
                  disabled={isSubmitting}
                  aria-invalid={Boolean(errors.fecha_aplicacion)}
                />
                {errors.fecha_aplicacion && (
                  <p className="text-xs text-destructive">{errors.fecha_aplicacion}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="desparasitacion-proxima">Próxima aplicación</Label>
                <Input
                  id="desparasitacion-proxima"
                  type="date"
                  value={values.proxima_aplicacion}
                  onChange={(event) => updateField("proxima_aplicacion", event.target.value)}
                  disabled={isSubmitting}
                  aria-invalid={Boolean(errors.proxima_aplicacion)}
                />
                {errors.proxima_aplicacion && (
                  <p className="text-xs text-destructive">{errors.proxima_aplicacion}</p>
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="desparasitacion-dosis">Dosis</Label>
                <Input
                  id="desparasitacion-dosis"
                  value={values.dosis}
                  onChange={(event) => updateField("dosis", event.target.value)}
                  placeholder="Ej. 10 ml"
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="desparasitacion-veterinario">Veterinario</Label>
                <Input
                  id="desparasitacion-veterinario"
                  value={values.veterinario}
                  onChange={(event) => updateField("veterinario", event.target.value)}
                  placeholder="Nombre del veterinario"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="desparasitacion-observaciones">Observaciones</Label>
              <Textarea
                id="desparasitacion-observaciones"
                value={values.observaciones}
                onChange={(event) => updateField("observaciones", event.target.value)}
                placeholder="Notas adicionales..."
                disabled={isSubmitting}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="size-4 animate-spin" />}
              {isEdit ? "Guardar cambios" : "Registrar desparasitación"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
