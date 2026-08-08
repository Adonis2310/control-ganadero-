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
import type { EventoReproductivoRow } from "@/features/ganado/types";
import {
  EMPTY_DIAGNOSTICO_FORM,
  validateDiagnosticoForm,
  type DiagnosticoFormErrors,
  type DiagnosticoFormValues,
} from "@/features/ganado/validations/diagnostico.schema";
import { createClient } from "@/lib/supabase/client";
import { eventosReproductivosService } from "@/services/eventos-reproductivos.service";
import { reproduccionService } from "@/services/reproduccion.service";

const RESULTADO_LABEL: Record<string, string> = {
  positivo: "Positivo",
  negativo: "Negativo",
};

interface PregnancyDiagnosisFormDialogProps {
  animalId: string;
  evento: EventoReproductivoRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

function toFormValues(evento: EventoReproductivoRow | null): DiagnosticoFormValues {
  if (!evento) return EMPTY_DIAGNOSTICO_FORM;
  return {
    fecha: evento.fecha,
    resultado: (evento.resultado_diagnostico ?? "") as DiagnosticoFormValues["resultado"],
    metodo: evento.metodo_diagnostico ?? "",
    veterinario: evento.veterinario ?? "",
    observaciones: evento.observaciones ?? "",
  };
}

export function PregnancyDiagnosisFormDialog({
  animalId,
  evento,
  open,
  onOpenChange,
  onSaved,
}: PregnancyDiagnosisFormDialogProps) {
  const [values, setValues] = useState<DiagnosticoFormValues>(() => toFormValues(evento));
  const [errors, setErrors] = useState<DiagnosticoFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEdit = evento !== null;

  useEffect(() => {
    if (open) {
      setValues(toFormValues(evento));
      setErrors({});
    }
  }, [open, evento]);

  function updateField<K extends keyof DiagnosticoFormValues>(
    key: K,
    value: DiagnosticoFormValues[K],
  ) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const fieldErrors = validateDiagnosticoForm(values);
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
          resultado_diagnostico: values.resultado,
          metodo_diagnostico: values.metodo?.trim() || null,
          veterinario: values.veterinario?.trim() || null,
          observaciones: values.observaciones?.trim() || null,
        });
        toast.success("Diagnóstico actualizado", { description: "Se guardaron los cambios." });
      } else {
        await reproduccionService.registrarDiagnostico(supabase, animalId, {
          fecha: values.fecha,
          resultado: values.resultado,
          metodo: values.metodo?.trim() || null,
          veterinario: values.veterinario?.trim() || null,
          observaciones: values.observaciones?.trim() || null,
        });
        toast.success("Diagnóstico registrado", {
          description:
            values.resultado === "positivo"
              ? "Se confirmó la gestación y se calculó la fecha estimada de parto."
              : "Se registró el diagnóstico negativo.",
        });
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
            <DialogTitle>{isEdit ? "Editar diagnóstico" : "Registrar diagnóstico de preñez"}</DialogTitle>
            <DialogDescription>
              {isEdit
                ? "Actualiza los datos de este diagnóstico."
                : "Un resultado positivo confirma o crea la gestación y calcula la fecha estimada de parto."}
            </DialogDescription>
          </DialogHeader>

          <div className="flex max-h-[60vh] flex-col gap-4 overflow-y-auto px-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="diagnostico-fecha">Fecha del diagnóstico *</Label>
              <Input
                id="diagnostico-fecha"
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
              <Label htmlFor="diagnostico-resultado">Resultado *</Label>
              <Select
                value={values.resultado}
                onValueChange={(next) =>
                  updateField("resultado", (next ?? "") as DiagnosticoFormValues["resultado"])
                }
                disabled={isSubmitting}
              >
                <SelectTrigger id="diagnostico-resultado" className="w-full" aria-invalid={Boolean(errors.resultado)}>
                  <SelectValue placeholder="Selecciona el resultado">
                    {(current: string | null) => (current ? RESULTADO_LABEL[current] : "Selecciona el resultado")}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="positivo">Positivo</SelectItem>
                  <SelectItem value="negativo">Negativo</SelectItem>
                </SelectContent>
              </Select>
              {errors.resultado && <p className="text-xs text-destructive">{errors.resultado}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="diagnostico-metodo">Método</Label>
              <Input
                id="diagnostico-metodo"
                value={values.metodo}
                onChange={(event) => updateField("metodo", event.target.value)}
                placeholder="Ej. Palpación, ecografía..."
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="diagnostico-veterinario">Veterinario</Label>
              <Input
                id="diagnostico-veterinario"
                value={values.veterinario}
                onChange={(event) => updateField("veterinario", event.target.value)}
                placeholder="Nombre del veterinario"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="diagnostico-observaciones">Observaciones</Label>
              <Textarea
                id="diagnostico-observaciones"
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
              {isEdit ? "Guardar cambios" : "Registrar diagnóstico"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
