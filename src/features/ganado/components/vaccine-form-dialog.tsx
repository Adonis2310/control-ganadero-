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
import type { VacunaRow } from "@/features/ganado/types";
import {
  EMPTY_VACUNA_FORM,
  validateVacunaForm,
  type VacunaFormErrors,
  type VacunaFormValues,
} from "@/features/ganado/validations/vacuna.schema";
import { createClient } from "@/lib/supabase/client";
import { vacunasService } from "@/services/vacunas.service";

interface VaccineFormDialogProps {
  animalId: string;
  vacuna: VacunaRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

function toFormValues(vacuna: VacunaRow | null): VacunaFormValues {
  if (!vacuna) return EMPTY_VACUNA_FORM;
  return {
    nombre: vacuna.nombre,
    fecha_aplicacion: vacuna.fecha_aplicacion,
    proxima_aplicacion: vacuna.proxima_aplicacion ?? "",
    dosis: vacuna.dosis ?? "",
    veterinario: vacuna.veterinario ?? "",
    observaciones: vacuna.observaciones ?? "",
  };
}

export function VaccineFormDialog({
  animalId,
  vacuna,
  open,
  onOpenChange,
  onSaved,
}: VaccineFormDialogProps) {
  const [values, setValues] = useState<VacunaFormValues>(() => toFormValues(vacuna));
  const [errors, setErrors] = useState<VacunaFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEdit = vacuna !== null;

  useEffect(() => {
    if (open) {
      setValues(toFormValues(vacuna));
      setErrors({});
    }
  }, [open, vacuna]);

  function updateField<K extends keyof VacunaFormValues>(key: K, value: VacunaFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const fieldErrors = validateVacunaForm(values);
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    const supabase = createClient();

    try {
      const payload = {
        animal_id: animalId,
        nombre: values.nombre.trim(),
        fecha_aplicacion: values.fecha_aplicacion,
        proxima_aplicacion: values.proxima_aplicacion?.trim() || null,
        dosis: values.dosis?.trim() || null,
        veterinario: values.veterinario?.trim() || null,
        observaciones: values.observaciones?.trim() || null,
      };

      if (isEdit) {
        await vacunasService.update(supabase, vacuna.id, payload);
        toast.success("Vacuna actualizada", { description: "Se guardaron los cambios." });
      } else {
        await vacunasService.create(supabase, payload);
        toast.success("Vacuna registrada", { description: `Se registró "${values.nombre}".` });
      }

      onSaved();
      onOpenChange(false);
    } catch {
      toast.error("No se pudo guardar la vacuna", {
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
            <DialogTitle>{isEdit ? "Editar vacuna" : "Registrar vacuna"}</DialogTitle>
            <DialogDescription>
              {isEdit
                ? "Actualiza los datos de este registro de vacunación."
                : "Agrega una nueva vacuna al historial del animal."}
            </DialogDescription>
          </DialogHeader>

          <div className="flex max-h-[60vh] flex-col gap-4 overflow-y-auto px-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="vacuna-nombre">Nombre de la vacuna *</Label>
              <Input
                id="vacuna-nombre"
                value={values.nombre}
                onChange={(event) => updateField("nombre", event.target.value)}
                placeholder="Ej. Fiebre aftosa"
                disabled={isSubmitting}
                aria-invalid={Boolean(errors.nombre)}
              />
              {errors.nombre && <p className="text-xs text-destructive">{errors.nombre}</p>}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="vacuna-fecha">Fecha de aplicación *</Label>
                <Input
                  id="vacuna-fecha"
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
                <Label htmlFor="vacuna-proxima">Próxima aplicación</Label>
                <Input
                  id="vacuna-proxima"
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
                <Label htmlFor="vacuna-dosis">Dosis</Label>
                <Input
                  id="vacuna-dosis"
                  value={values.dosis}
                  onChange={(event) => updateField("dosis", event.target.value)}
                  placeholder="Ej. 5 ml"
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vacuna-veterinario">Veterinario</Label>
                <Input
                  id="vacuna-veterinario"
                  value={values.veterinario}
                  onChange={(event) => updateField("veterinario", event.target.value)}
                  placeholder="Nombre del veterinario"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="vacuna-observaciones">Observaciones</Label>
              <Textarea
                id="vacuna-observaciones"
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
              {isEdit ? "Guardar cambios" : "Registrar vacuna"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
