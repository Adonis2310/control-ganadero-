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
import type { EventoReproductivoRow } from "@/features/ganado/types";
import {
  EMPTY_CELO_FORM,
  validateCeloForm,
  type CeloFormErrors,
  type CeloFormValues,
} from "@/features/ganado/validations/celo.schema";
import { createClient } from "@/lib/supabase/client";
import { eventosReproductivosService } from "@/services/eventos-reproductivos.service";
import { reproduccionService } from "@/services/reproduccion.service";

interface HeatFormDialogProps {
  animalId: string;
  evento: EventoReproductivoRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

function toFormValues(evento: EventoReproductivoRow | null): CeloFormValues {
  if (!evento) return EMPTY_CELO_FORM;
  return { fecha: evento.fecha, observaciones: evento.observaciones ?? "" };
}

export function HeatFormDialog({ animalId, evento, open, onOpenChange, onSaved }: HeatFormDialogProps) {
  const [values, setValues] = useState<CeloFormValues>(() => toFormValues(evento));
  const [errors, setErrors] = useState<CeloFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEdit = evento !== null;

  useEffect(() => {
    if (open) {
      setValues(toFormValues(evento));
      setErrors({});
    }
  }, [open, evento]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const fieldErrors = validateCeloForm(values);
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
          observaciones: values.observaciones?.trim() || null,
        });
        toast.success("Celo actualizado", { description: "Se guardaron los cambios." });
      } else {
        await reproduccionService.registrarCelo(supabase, animalId, {
          fecha: values.fecha,
          observaciones: values.observaciones?.trim() || null,
        });
        toast.success("Celo registrado", { description: "Se agregó al historial reproductivo." });
      }

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
            <DialogTitle>{isEdit ? "Editar celo" : "Registrar celo"}</DialogTitle>
            <DialogDescription>
              {isEdit
                ? "Actualiza los datos de este registro."
                : "Agrega un nuevo celo al historial reproductivo del animal."}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 px-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="celo-fecha">Fecha *</Label>
              <Input
                id="celo-fecha"
                type="date"
                value={values.fecha}
                max={new Date().toISOString().split("T")[0]}
                onChange={(event) => {
                  setValues((prev) => ({ ...prev, fecha: event.target.value }));
                  setErrors((prev) => ({ ...prev, fecha: undefined }));
                }}
                disabled={isSubmitting}
                aria-invalid={Boolean(errors.fecha)}
              />
              {errors.fecha && <p className="text-xs text-destructive">{errors.fecha}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="celo-observaciones">Observaciones</Label>
              <Textarea
                id="celo-observaciones"
                value={values.observaciones}
                onChange={(event) =>
                  setValues((prev) => ({ ...prev, observaciones: event.target.value }))
                }
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
              {isEdit ? "Guardar cambios" : "Registrar celo"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
