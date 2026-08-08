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
import type { EventoReproductivoRow, GestacionRow } from "@/features/ganado/types";
import {
  EMPTY_PARTO_FORM,
  validatePartoForm,
  type PartoFormErrors,
  type PartoFormValues,
} from "@/features/ganado/validations/parto.schema";
import { createClient } from "@/lib/supabase/client";
import { eventosReproductivosService } from "@/services/eventos-reproductivos.service";
import { reproduccionService } from "@/services/reproduccion.service";

const ESTADO_PARTO_LABEL: Record<string, string> = {
  normal: "Normal",
  complicaciones: "Con complicaciones",
};

interface BirthFormDialogProps {
  animalId: string;
  evento: EventoReproductivoRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
  onRegistered?: (gestacion: GestacionRow) => void;
}

function toFormValues(evento: EventoReproductivoRow | null): PartoFormValues {
  if (!evento) return EMPTY_PARTO_FORM;
  return {
    fecha: evento.fecha,
    numero_crias: String(evento.numero_crias ?? 1),
    estado_parto: (evento.estado_parto ?? "normal") as PartoFormValues["estado_parto"],
    observaciones: evento.observaciones ?? "",
  };
}

export function BirthFormDialog({
  animalId,
  evento,
  open,
  onOpenChange,
  onSaved,
  onRegistered,
}: BirthFormDialogProps) {
  const [values, setValues] = useState<PartoFormValues>(() => toFormValues(evento));
  const [errors, setErrors] = useState<PartoFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEdit = evento !== null;

  useEffect(() => {
    if (open) {
      setValues(toFormValues(evento));
      setErrors({});
    }
  }, [open, evento]);

  function updateField<K extends keyof PartoFormValues>(key: K, value: PartoFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const fieldErrors = validatePartoForm(values);
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    const supabase = createClient();

    try {
      if (isEdit) {
        await eventosReproductivosService.update(supabase, evento.id, {
          fecha: values.fecha,
          numero_crias: Number(values.numero_crias),
          estado_parto: values.estado_parto,
          observaciones: values.observaciones?.trim() || null,
        });
        toast.success("Parto actualizado", { description: "Se guardaron los cambios." });
        onSaved();
      } else {
        const { gestacion } = await reproduccionService.registrarParto(supabase, animalId, {
          fecha: values.fecha,
          numeroCrias: Number(values.numero_crias),
          estadoParto: values.estado_parto,
          observaciones: values.observaciones?.trim() || null,
        });
        toast.success("Parto registrado", {
          description: "Ahora puedes registrar los datos de la(s) cría(s).",
        });
        onSaved();
        onRegistered?.(gestacion);
      }

      onOpenChange(false);
    } catch {
      toast.error("No se pudo guardar el parto", {
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
            <DialogTitle>{isEdit ? "Editar parto" : "Registrar parto"}</DialogTitle>
            <DialogDescription>
              {isEdit
                ? "Actualiza los datos de este parto."
                : "Finaliza la gestación en curso y registra el parto."}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 px-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="parto-fecha">Fecha del parto *</Label>
              <Input
                id="parto-fecha"
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
              <Label htmlFor="parto-numero-crias">Número de crías *</Label>
              <Input
                id="parto-numero-crias"
                type="number"
                min={1}
                step={1}
                value={values.numero_crias}
                onChange={(event) => updateField("numero_crias", event.target.value)}
                disabled={isSubmitting}
                aria-invalid={Boolean(errors.numero_crias)}
              />
              {errors.numero_crias && (
                <p className="text-xs text-destructive">{errors.numero_crias}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="parto-estado">Estado del parto *</Label>
              <Select
                value={values.estado_parto}
                onValueChange={(next) =>
                  updateField("estado_parto", (next ?? "normal") as PartoFormValues["estado_parto"])
                }
                disabled={isSubmitting}
              >
                <SelectTrigger id="parto-estado" className="w-full">
                  <SelectValue>
                    {(current: string | null) =>
                      current ? ESTADO_PARTO_LABEL[current] : "Selecciona el estado"
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="complicaciones">Con complicaciones</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="parto-observaciones">Observaciones</Label>
              <Textarea
                id="parto-observaciones"
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
              {isEdit ? "Guardar cambios" : "Registrar parto"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
