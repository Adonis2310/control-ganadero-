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
import type { EnfermedadRow } from "@/features/ganado/types";
import {
  EMPTY_ENFERMEDAD_FORM,
  validateEnfermedadForm,
  type EnfermedadFormErrors,
  type EnfermedadFormValues,
} from "@/features/ganado/validations/enfermedad.schema";
import { createClient } from "@/lib/supabase/client";
import { enfermedadesService } from "@/services/enfermedades.service";

interface DiseaseFormDialogProps {
  animalId: string;
  enfermedad: EnfermedadRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

function toFormValues(enfermedad: EnfermedadRow | null): EnfermedadFormValues {
  if (!enfermedad) return EMPTY_ENFERMEDAD_FORM;
  return {
    enfermedad: enfermedad.enfermedad,
    fecha_diagnostico: enfermedad.fecha_diagnostico,
    descripcion: enfermedad.descripcion ?? "",
    veterinario: enfermedad.veterinario ?? "",
    observaciones: enfermedad.observaciones ?? "",
  };
}

export function DiseaseFormDialog({
  animalId,
  enfermedad,
  open,
  onOpenChange,
  onSaved,
}: DiseaseFormDialogProps) {
  const [values, setValues] = useState<EnfermedadFormValues>(() => toFormValues(enfermedad));
  const [errors, setErrors] = useState<EnfermedadFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEdit = enfermedad !== null;

  useEffect(() => {
    if (open) {
      setValues(toFormValues(enfermedad));
      setErrors({});
    }
  }, [open, enfermedad]);

  function updateField<K extends keyof EnfermedadFormValues>(
    key: K,
    value: EnfermedadFormValues[K],
  ) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const fieldErrors = validateEnfermedadForm(values);
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    const supabase = createClient();

    try {
      const payload = {
        animal_id: animalId,
        enfermedad: values.enfermedad.trim(),
        fecha_diagnostico: values.fecha_diagnostico,
        descripcion: values.descripcion?.trim() || null,
        veterinario: values.veterinario?.trim() || null,
        observaciones: values.observaciones?.trim() || null,
      };

      if (isEdit) {
        await enfermedadesService.update(supabase, enfermedad.id, payload);
        toast.success("Enfermedad actualizada", { description: "Se guardaron los cambios." });
      } else {
        await enfermedadesService.create(supabase, payload);
        toast.success("Enfermedad registrada", {
          description: `Se registró "${values.enfermedad}" como activa.`,
        });
      }

      onSaved();
      onOpenChange(false);
    } catch {
      toast.error("No se pudo guardar la enfermedad", {
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
            <DialogTitle>{isEdit ? "Editar enfermedad" : "Registrar enfermedad"}</DialogTitle>
            <DialogDescription>
              {isEdit
                ? "Actualiza los datos de este diagnóstico."
                : "El estado inicial será \"Activa\". Podrás marcarla como recuperada después."}
            </DialogDescription>
          </DialogHeader>

          <div className="flex max-h-[60vh] flex-col gap-4 overflow-y-auto px-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="enfermedad-nombre">Enfermedad *</Label>
              <Input
                id="enfermedad-nombre"
                value={values.enfermedad}
                onChange={(event) => updateField("enfermedad", event.target.value)}
                placeholder="Ej. Mastitis"
                disabled={isSubmitting}
                aria-invalid={Boolean(errors.enfermedad)}
              />
              {errors.enfermedad && <p className="text-xs text-destructive">{errors.enfermedad}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="enfermedad-fecha">Fecha de diagnóstico *</Label>
              <Input
                id="enfermedad-fecha"
                type="date"
                value={values.fecha_diagnostico}
                max={new Date().toISOString().split("T")[0]}
                onChange={(event) => updateField("fecha_diagnostico", event.target.value)}
                disabled={isSubmitting}
                aria-invalid={Boolean(errors.fecha_diagnostico)}
              />
              {errors.fecha_diagnostico && (
                <p className="text-xs text-destructive">{errors.fecha_diagnostico}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="enfermedad-descripcion">Descripción</Label>
              <Textarea
                id="enfermedad-descripcion"
                value={values.descripcion}
                onChange={(event) => updateField("descripcion", event.target.value)}
                placeholder="Síntomas, diagnóstico..."
                disabled={isSubmitting}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="enfermedad-veterinario">Veterinario</Label>
              <Input
                id="enfermedad-veterinario"
                value={values.veterinario}
                onChange={(event) => updateField("veterinario", event.target.value)}
                placeholder="Nombre del veterinario"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="enfermedad-observaciones">Observaciones</Label>
              <Textarea
                id="enfermedad-observaciones"
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
              {isEdit ? "Guardar cambios" : "Registrar enfermedad"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
