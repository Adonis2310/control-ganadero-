"use client";

import { useEffect, useState } from "react";
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
import { PRIORIDAD_ACTIVIDAD_OPTIONS, type ActividadConAnimal } from "@/features/calendario/types";
import {
  validateReprogramarForm,
  type ReprogramarFormErrors,
  type ReprogramarFormValues,
} from "@/features/calendario/validations/actividad.schema";
import { createClient } from "@/lib/supabase/client";
import { actividadesService } from "@/services/actividades.service";

interface RescheduleActivityDialogProps {
  actividad: ActividadConAnimal | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRescheduled: () => void;
}

function toFormValues(actividad: ActividadConAnimal | null): ReprogramarFormValues {
  if (!actividad) return { fecha: "", hora_inicio: "", hora_fin: "", prioridad: "media" };
  return {
    fecha: actividad.fecha,
    hora_inicio: actividad.hora_inicio ?? "",
    hora_fin: actividad.hora_fin ?? "",
    prioridad: actividad.prioridad,
  };
}

export function RescheduleActivityDialog({ actividad, open, onOpenChange, onRescheduled }: RescheduleActivityDialogProps) {
  const [values, setValues] = useState<ReprogramarFormValues>(toFormValues(null));
  const [errors, setErrors] = useState<ReprogramarFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setValues(toFormValues(actividad));
      setErrors({});
    }
  }, [open, actividad]);

  function updateField<K extends keyof ReprogramarFormValues>(key: K, value: ReprogramarFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  async function handleSubmit() {
    if (!actividad) return;

    const fieldErrors = validateReprogramarForm(values);
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      toast.error("Revisa los campos marcados");
      return;
    }

    setIsSubmitting(true);
    try {
      const supabase = createClient();
      await actividadesService.reprogramar(supabase, actividad.id, {
        fecha: values.fecha,
        hora_inicio: values.hora_inicio?.trim() || null,
        hora_fin: values.hora_fin?.trim() || null,
        prioridad: values.prioridad as ActividadConAnimal["prioridad"],
      });
      toast.success("Actividad reprogramada");
      onRescheduled();
      onOpenChange(false);
    } catch {
      toast.error("No se pudo reprogramar la actividad", { description: "Intenta nuevamente en unos segundos." });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reprogramar actividad</DialogTitle>
          <DialogDescription>
            {actividad && (
              <>
                Cambia la fecha, hora o prioridad de <strong className="text-foreground">{actividad.titulo}</strong>. La
                actividad existente se actualiza; no se crea un registro duplicado.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="reprogramar-fecha">Fecha *</Label>
            <Input
              id="reprogramar-fecha"
              type="date"
              value={values.fecha}
              onChange={(event) => updateField("fecha", event.target.value)}
              disabled={isSubmitting}
              aria-invalid={Boolean(errors.fecha)}
            />
            {errors.fecha && <p className="text-xs text-destructive">{errors.fecha}</p>}
          </div>

          <div className="space-y-2">
            <Label>Prioridad *</Label>
            <Select value={values.prioridad} onValueChange={(value) => updateField("prioridad", value ?? "media")} disabled={isSubmitting}>
              <SelectTrigger className="w-full">
                <SelectValue>
                  {(current: string | null) =>
                    PRIORIDAD_ACTIVIDAD_OPTIONS.find((option) => option.value === current)?.label ?? "Selecciona"
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {PRIORIDAD_ACTIVIDAD_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reprogramar-hora-inicio">Hora de inicio</Label>
            <Input
              id="reprogramar-hora-inicio"
              type="time"
              value={values.hora_inicio}
              onChange={(event) => updateField("hora_inicio", event.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reprogramar-hora-fin">Hora de finalización</Label>
            <Input
              id="reprogramar-hora-fin"
              type="time"
              value={values.hora_fin}
              onChange={(event) => updateField("hora_fin", event.target.value)}
              disabled={isSubmitting}
              aria-invalid={Boolean(errors.hora_fin)}
            />
            {errors.hora_fin && <p className="text-xs text-destructive">{errors.hora_fin}</p>}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Volver
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="size-4 animate-spin" />}
            Reprogramar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
