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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { EnfermedadRow, TratamientoConEnfermedad } from "@/features/ganado/types";
import {
  EMPTY_TRATAMIENTO_FORM,
  validateTratamientoForm,
  type TratamientoFormErrors,
  type TratamientoFormValues,
} from "@/features/ganado/validations/tratamiento.schema";
import { createClient } from "@/lib/supabase/client";
import { tratamientosService } from "@/services/tratamientos.service";

interface TreatmentFormDialogProps {
  animalId: string;
  tratamiento: TratamientoConEnfermedad | null;
  enfermedades: EnfermedadRow[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

function toFormValues(tratamiento: TratamientoConEnfermedad | null): TratamientoFormValues {
  if (!tratamiento) return EMPTY_TRATAMIENTO_FORM;
  return {
    enfermedad_id: tratamiento.enfermedad_id ?? "",
    tratamiento: tratamiento.tratamiento,
    medicamento: tratamiento.medicamento ?? "",
    fecha_inicio: tratamiento.fecha_inicio,
    fecha_fin: tratamiento.fecha_fin ?? "",
    dosis: tratamiento.dosis ?? "",
    frecuencia: tratamiento.frecuencia ?? "",
    veterinario: tratamiento.veterinario ?? "",
    observaciones: tratamiento.observaciones ?? "",
  };
}

export function TreatmentFormDialog({
  animalId,
  tratamiento,
  enfermedades,
  open,
  onOpenChange,
  onSaved,
}: TreatmentFormDialogProps) {
  const [values, setValues] = useState<TratamientoFormValues>(() => toFormValues(tratamiento));
  const [errors, setErrors] = useState<TratamientoFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEdit = tratamiento !== null;

  useEffect(() => {
    if (open) {
      setValues(toFormValues(tratamiento));
      setErrors({});
    }
  }, [open, tratamiento]);

  function updateField<K extends keyof TratamientoFormValues>(
    key: K,
    value: TratamientoFormValues[K],
  ) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const fieldErrors = validateTratamientoForm(values);
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    const supabase = createClient();

    try {
      const payload = {
        animal_id: animalId,
        enfermedad_id: values.enfermedad_id?.trim() || null,
        tratamiento: values.tratamiento.trim(),
        medicamento: values.medicamento?.trim() || null,
        fecha_inicio: values.fecha_inicio,
        fecha_fin: values.fecha_fin?.trim() || null,
        dosis: values.dosis?.trim() || null,
        frecuencia: values.frecuencia?.trim() || null,
        veterinario: values.veterinario?.trim() || null,
        observaciones: values.observaciones?.trim() || null,
      };

      if (isEdit) {
        await tratamientosService.update(supabase, tratamiento.id, payload);
        toast.success("Tratamiento actualizado", { description: "Se guardaron los cambios." });
      } else {
        await tratamientosService.create(supabase, payload);
        toast.success("Tratamiento registrado", {
          description: `Se registró "${values.tratamiento}".`,
        });
      }

      onSaved();
      onOpenChange(false);
    } catch {
      toast.error("No se pudo guardar el tratamiento", {
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
            <DialogTitle>{isEdit ? "Editar tratamiento" : "Registrar tratamiento"}</DialogTitle>
            <DialogDescription>
              {isEdit
                ? "Actualiza los datos de este tratamiento."
                : "Agrega un nuevo tratamiento al historial del animal."}
            </DialogDescription>
          </DialogHeader>

          <div className="flex max-h-[60vh] flex-col gap-4 overflow-y-auto px-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="tratamiento-enfermedad">Enfermedad relacionada</Label>
              <Select
                value={values.enfermedad_id || "ninguna"}
                onValueChange={(next) =>
                  updateField("enfermedad_id", !next || next === "ninguna" ? "" : next)
                }
                disabled={isSubmitting}
              >
                <SelectTrigger id="tratamiento-enfermedad" className="w-full">
                  <SelectValue placeholder="Sin enfermedad relacionada">
                    {(current: string | null) => {
                      if (!current || current === "ninguna") return "Sin enfermedad relacionada";
                      const option = enfermedades.find((e) => e.id === current);
                      return option?.enfermedad ?? "Sin enfermedad relacionada";
                    }}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ninguna">Sin enfermedad relacionada</SelectItem>
                  {enfermedades.map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.enfermedad}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tratamiento-nombre">Tratamiento *</Label>
              <Input
                id="tratamiento-nombre"
                value={values.tratamiento}
                onChange={(event) => updateField("tratamiento", event.target.value)}
                placeholder="Ej. Antibiótico intramuscular"
                disabled={isSubmitting}
                aria-invalid={Boolean(errors.tratamiento)}
              />
              {errors.tratamiento && (
                <p className="text-xs text-destructive">{errors.tratamiento}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tratamiento-medicamento">Medicamento</Label>
              <Input
                id="tratamiento-medicamento"
                value={values.medicamento}
                onChange={(event) => updateField("medicamento", event.target.value)}
                placeholder="Ej. Penicilina"
                disabled={isSubmitting}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="tratamiento-inicio">Fecha de inicio *</Label>
                <Input
                  id="tratamiento-inicio"
                  type="date"
                  value={values.fecha_inicio}
                  max={new Date().toISOString().split("T")[0]}
                  onChange={(event) => updateField("fecha_inicio", event.target.value)}
                  disabled={isSubmitting}
                  aria-invalid={Boolean(errors.fecha_inicio)}
                />
                {errors.fecha_inicio && (
                  <p className="text-xs text-destructive">{errors.fecha_inicio}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="tratamiento-fin">Fecha de finalización</Label>
                <Input
                  id="tratamiento-fin"
                  type="date"
                  value={values.fecha_fin}
                  onChange={(event) => updateField("fecha_fin", event.target.value)}
                  disabled={isSubmitting}
                  aria-invalid={Boolean(errors.fecha_fin)}
                />
                {errors.fecha_fin && <p className="text-xs text-destructive">{errors.fecha_fin}</p>}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="tratamiento-dosis">Dosis</Label>
                <Input
                  id="tratamiento-dosis"
                  value={values.dosis}
                  onChange={(event) => updateField("dosis", event.target.value)}
                  placeholder="Ej. 10 ml"
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tratamiento-frecuencia">Frecuencia</Label>
                <Input
                  id="tratamiento-frecuencia"
                  value={values.frecuencia}
                  onChange={(event) => updateField("frecuencia", event.target.value)}
                  placeholder="Ej. Cada 12 horas"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tratamiento-veterinario">Veterinario</Label>
              <Input
                id="tratamiento-veterinario"
                value={values.veterinario}
                onChange={(event) => updateField("veterinario", event.target.value)}
                placeholder="Nombre del veterinario"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tratamiento-observaciones">Observaciones</Label>
              <Textarea
                id="tratamiento-observaciones"
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
              {isEdit ? "Guardar cambios" : "Registrar tratamiento"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
