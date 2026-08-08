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
import type { EnfermedadRow } from "@/features/ganado/types";
import {
  validateRecuperacionForm,
  type RecuperacionFormErrors,
  type RecuperacionFormValues,
} from "@/features/ganado/validations/enfermedad.schema";
import { createClient } from "@/lib/supabase/client";
import { enfermedadesService } from "@/services/enfermedades.service";

interface RecoverDiseaseDialogProps {
  enfermedad: EnfermedadRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRecovered: () => void;
}

function hoyISO(): string {
  return new Date().toISOString().split("T")[0];
}

export function RecoverDiseaseDialog({
  enfermedad,
  open,
  onOpenChange,
  onRecovered,
}: RecoverDiseaseDialogProps) {
  const [values, setValues] = useState<RecuperacionFormValues>({ fecha_recuperacion: hoyISO() });
  const [errors, setErrors] = useState<RecuperacionFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setValues({ fecha_recuperacion: hoyISO() });
      setErrors({});
    }
  }, [open]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!enfermedad) return;

    const fieldErrors = validateRecuperacionForm(values, enfermedad.fecha_diagnostico);
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const supabase = createClient();
      await enfermedadesService.marcarRecuperada(supabase, enfermedad.id, values.fecha_recuperacion);
      toast.success("Enfermedad marcada como recuperada");
      onRecovered();
      onOpenChange(false);
    } catch {
      toast.error("No se pudo actualizar la enfermedad", {
        description: "Intenta nuevamente en unos segundos.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Marcar como recuperada</DialogTitle>
            <DialogDescription>
              {enfermedad && (
                <>
                  Registra la fecha en la que{" "}
                  <strong className="text-foreground">{enfermedad.enfermedad}</strong> se
                  consideró recuperada.
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 px-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="recuperacion-fecha">Fecha de recuperación *</Label>
              <Input
                id="recuperacion-fecha"
                type="date"
                value={values.fecha_recuperacion}
                max={hoyISO()}
                onChange={(event) => {
                  setValues({ fecha_recuperacion: event.target.value });
                  setErrors({});
                }}
                disabled={isSubmitting}
                aria-invalid={Boolean(errors.fecha_recuperacion)}
              />
              {errors.fecha_recuperacion && (
                <p className="text-xs text-destructive">{errors.fecha_recuperacion}</p>
              )}
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
              Confirmar recuperación
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
