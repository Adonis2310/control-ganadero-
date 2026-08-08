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
import type { GestacionRow } from "@/features/ganado/types";
import { formatearFecha } from "@/features/ganado/utils/animal.utils";
import {
  EMPTY_ABORTO_FORM,
  validateAbortoForm,
  type AbortoFormErrors,
  type AbortoFormValues,
} from "@/features/ganado/validations/aborto.schema";
import { createClient } from "@/lib/supabase/client";
import { reproduccionService } from "@/services/reproduccion.service";

interface AbortionFormDialogProps {
  animalId: string;
  gestacionesActivas: GestacionRow[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

export function AbortionFormDialog({
  animalId,
  gestacionesActivas,
  open,
  onOpenChange,
  onSaved,
}: AbortionFormDialogProps) {
  const [values, setValues] = useState<AbortoFormValues>(() => ({
    ...EMPTY_ABORTO_FORM,
    gestacion_id: gestacionesActivas[0]?.id ?? "",
  }));
  const [errors, setErrors] = useState<AbortoFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setValues({ ...EMPTY_ABORTO_FORM, gestacion_id: gestacionesActivas[0]?.id ?? "" });
      setErrors({});
    }
  }, [open, gestacionesActivas]);

  function updateField<K extends keyof AbortoFormValues>(key: K, value: AbortoFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const fieldErrors = validateAbortoForm(values);
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    const supabase = createClient();

    try {
      await reproduccionService.registrarAborto(supabase, animalId, {
        fecha: values.fecha,
        gestacionId: values.gestacion_id?.trim() || null,
        motivo: values.motivo?.trim() || null,
        veterinario: values.veterinario?.trim() || null,
        observaciones: values.observaciones?.trim() || null,
      });
      toast.success("Aborto registrado", {
        description: "Se actualizó el estado de la gestación.",
      });

      onSaved();
      onOpenChange(false);
    } catch {
      toast.error("No se pudo guardar el registro", {
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
            <DialogTitle>Registrar aborto</DialogTitle>
            <DialogDescription>
              Esto finalizará la gestación relacionada, marcándola como abortada.
            </DialogDescription>
          </DialogHeader>

          <div className="flex max-h-[60vh] flex-col gap-4 overflow-y-auto px-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="aborto-fecha">Fecha *</Label>
              <Input
                id="aborto-fecha"
                type="date"
                value={values.fecha}
                max={new Date().toISOString().split("T")[0]}
                onChange={(event) => updateField("fecha", event.target.value)}
                disabled={isSubmitting}
                aria-invalid={Boolean(errors.fecha)}
              />
              {errors.fecha && <p className="text-xs text-destructive">{errors.fecha}</p>}
            </div>

            {gestacionesActivas.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="aborto-gestacion">Gestación relacionada</Label>
                <Select
                  value={values.gestacion_id || "ninguna"}
                  onValueChange={(next) =>
                    updateField("gestacion_id", next === "ninguna" ? "" : (next ?? ""))
                  }
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="aborto-gestacion" className="w-full">
                    <SelectValue>
                      {(current: string | null) => {
                        if (!current || current === "ninguna") return "Sin especificar";
                        const gestacion = gestacionesActivas.find((g) => g.id === current);
                        return gestacion
                          ? `Iniciada el ${formatearFecha(gestacion.fecha_inicio)}`
                          : "Sin especificar";
                      }}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {gestacionesActivas.map((gestacion) => (
                      <SelectItem key={gestacion.id} value={gestacion.id}>
                        Iniciada el {formatearFecha(gestacion.fecha_inicio)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="aborto-motivo">Motivo, si se conoce</Label>
              <Input
                id="aborto-motivo"
                value={values.motivo}
                onChange={(event) => updateField("motivo", event.target.value)}
                placeholder="Ej. Estrés, enfermedad..."
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="aborto-veterinario">Veterinario</Label>
              <Input
                id="aborto-veterinario"
                value={values.veterinario}
                onChange={(event) => updateField("veterinario", event.target.value)}
                placeholder="Nombre del veterinario"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="aborto-observaciones">Observaciones</Label>
              <Textarea
                id="aborto-observaciones"
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
            <Button type="submit" variant="destructive" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="size-4 animate-spin" />}
              Registrar aborto
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
