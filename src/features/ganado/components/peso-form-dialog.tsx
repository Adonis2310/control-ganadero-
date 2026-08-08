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
import type { PesoRow } from "@/features/ganado/types";
import {
  EMPTY_PESO_FORM,
  validatePesoForm,
  type PesoFormErrors,
  type PesoFormValues,
} from "@/features/ganado/validations/peso.schema";
import { createClient } from "@/lib/supabase/client";
import { pesosService } from "@/services/pesos.service";

interface PesoFormDialogProps {
  animalId: string;
  peso: PesoRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

function toFormValues(peso: PesoRow | null): PesoFormValues {
  if (!peso) return EMPTY_PESO_FORM;
  return {
    fecha: peso.fecha,
    peso: String(peso.peso),
    observaciones: peso.observaciones ?? "",
  };
}

export function PesoFormDialog({
  animalId,
  peso,
  open,
  onOpenChange,
  onSaved,
}: PesoFormDialogProps) {
  const [values, setValues] = useState<PesoFormValues>(() => toFormValues(peso));
  const [errors, setErrors] = useState<PesoFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEdit = peso !== null;

  useEffect(() => {
    if (open) {
      setValues(toFormValues(peso));
      setErrors({});
    }
  }, [open, peso]);

  function updateField<K extends keyof PesoFormValues>(key: K, value: PesoFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const fieldErrors = validatePesoForm(values);
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    const supabase = createClient();

    try {
      const payload = {
        animal_id: animalId,
        fecha: values.fecha,
        peso: Number(values.peso),
        observaciones: values.observaciones?.trim() || null,
      };

      if (isEdit) {
        await pesosService.update(supabase, peso.id, payload);
        toast.success("Pesaje actualizado", {
          description: "Se guardaron los cambios del registro.",
        });
      } else {
        await pesosService.create(supabase, payload);
        toast.success("Pesaje registrado", {
          description: `Se registró un peso de ${values.peso} kg.`,
        });
      }

      onSaved();
      onOpenChange(false);
    } catch {
      toast.error("No se pudo guardar el pesaje", {
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
            <DialogTitle>{isEdit ? "Editar pesaje" : "Registrar peso"}</DialogTitle>
            <DialogDescription>
              {isEdit
                ? "Actualiza los datos de este registro de peso."
                : "Agrega un nuevo pesaje al historial del animal."}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 px-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="peso-fecha">Fecha *</Label>
              <Input
                id="peso-fecha"
                type="date"
                value={values.fecha}
                max={new Date().toISOString().split("T")[0]}
                onChange={(event) => updateField("fecha", event.target.value)}
                disabled={isSubmitting}
                aria-invalid={Boolean(errors.fecha)}
              />
              {errors.fecha && <p className="text-xs text-destructive">{errors.fecha}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="peso-valor">Peso (kg) *</Label>
              <Input
                id="peso-valor"
                type="number"
                inputMode="decimal"
                min={0}
                step="0.1"
                value={values.peso}
                onChange={(event) => updateField("peso", event.target.value)}
                placeholder="Ej. 320"
                disabled={isSubmitting}
                aria-invalid={Boolean(errors.peso)}
              />
              {errors.peso && <p className="text-xs text-destructive">{errors.peso}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="peso-observaciones">Observaciones</Label>
              <Textarea
                id="peso-observaciones"
                value={values.observaciones}
                onChange={(event) => updateField("observaciones", event.target.value)}
                placeholder="Notas sobre este pesaje..."
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
              {isEdit ? "Guardar cambios" : "Registrar peso"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
