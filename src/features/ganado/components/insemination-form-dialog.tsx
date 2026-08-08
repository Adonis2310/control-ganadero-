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
import type { AnimalRef, EventoReproductivoRow } from "@/features/ganado/types";
import {
  EMPTY_INSEMINACION_FORM,
  validateInseminacionForm,
  type InseminacionFormErrors,
  type InseminacionFormValues,
} from "@/features/ganado/validations/inseminacion.schema";
import { createClient } from "@/lib/supabase/client";
import { animalesService } from "@/services/animales.service";
import { eventosReproductivosService } from "@/services/eventos-reproductivos.service";
import { reproduccionService } from "@/services/reproduccion.service";

interface InseminationFormDialogProps {
  animalId: string;
  fincaId: string;
  evento: EventoReproductivoRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

function toFormValues(evento: EventoReproductivoRow | null): InseminacionFormValues {
  if (!evento) return EMPTY_INSEMINACION_FORM;
  return {
    fecha: evento.fecha,
    metodo: evento.metodo_inseminacion ?? "",
    identificacion_semen: evento.identificacion_semen ?? "",
    macho_id: evento.macho_id ?? "",
    tecnico: evento.veterinario ?? "",
    observaciones: evento.observaciones ?? "",
  };
}

export function InseminationFormDialog({
  animalId,
  fincaId,
  evento,
  open,
  onOpenChange,
  onSaved,
}: InseminationFormDialogProps) {
  const [values, setValues] = useState<InseminacionFormValues>(() => toFormValues(evento));
  const [errors, setErrors] = useState<InseminacionFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [machos, setMachos] = useState<AnimalRef[]>([]);
  const isEdit = evento !== null;

  useEffect(() => {
    if (open) {
      setValues(toFormValues(evento));
      setErrors({});
      const supabase = createClient();
      animalesService
        .listForBreedingSelect(supabase, fincaId, "macho")
        .then(setMachos)
        .catch(() => {});
    }
  }, [open, evento, fincaId]);

  function updateField<K extends keyof InseminacionFormValues>(
    key: K,
    value: InseminacionFormValues[K],
  ) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const fieldErrors = validateInseminacionForm(values);
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
          metodo_inseminacion: values.metodo?.trim() || null,
          identificacion_semen: values.identificacion_semen?.trim() || null,
          macho_id: values.macho_id?.trim() || null,
          veterinario: values.tecnico?.trim() || null,
          observaciones: values.observaciones?.trim() || null,
        });
        toast.success("Inseminación actualizada", { description: "Se guardaron los cambios." });
      } else {
        await reproduccionService.registrarInseminacion(supabase, animalId, {
          fecha: values.fecha,
          metodo: values.metodo?.trim() || null,
          identificacionSemen: values.identificacion_semen?.trim() || null,
          machoId: values.macho_id?.trim() || null,
          tecnico: values.tecnico?.trim() || null,
          observaciones: values.observaciones?.trim() || null,
        });
        toast.success("Inseminación registrada", {
          description: "Se agregó al historial reproductivo.",
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
            <DialogTitle>{isEdit ? "Editar inseminación" : "Registrar inseminación"}</DialogTitle>
            <DialogDescription>
              {isEdit
                ? "Actualiza los datos de esta inseminación artificial."
                : "Registra una inseminación artificial."}
            </DialogDescription>
          </DialogHeader>

          <div className="flex max-h-[60vh] flex-col gap-4 overflow-y-auto px-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="inseminacion-fecha">Fecha *</Label>
              <Input
                id="inseminacion-fecha"
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
              <Label htmlFor="inseminacion-metodo">Método</Label>
              <Input
                id="inseminacion-metodo"
                value={values.metodo}
                onChange={(event) => updateField("metodo", event.target.value)}
                placeholder="Ej. Cervical, transcervical..."
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="inseminacion-semen">Toro / identificación del semen</Label>
              <Input
                id="inseminacion-semen"
                value={values.identificacion_semen}
                onChange={(event) => updateField("identificacion_semen", event.target.value)}
                placeholder="Ej. Código de la pajilla"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="inseminacion-macho">Macho de origen (si se conoce)</Label>
              <Select
                value={values.macho_id || "ninguno"}
                onValueChange={(next) => updateField("macho_id", next === "ninguno" ? "" : (next ?? ""))}
                disabled={isSubmitting}
              >
                <SelectTrigger id="inseminacion-macho" className="w-full">
                  <SelectValue placeholder="Sin registrar">
                    {(current: string | null) => {
                      if (!current || current === "ninguno") return "Sin registrar";
                      const option = machos.find((m) => m.id === current);
                      if (!option) return "Sin registrar";
                      return option.nombre ? `${option.identificador} — ${option.nombre}` : option.identificador;
                    }}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ninguno">Sin registrar</SelectItem>
                  {machos.map((macho) => (
                    <SelectItem key={macho.id} value={macho.id}>
                      {macho.identificador}
                      {macho.nombre ? ` — ${macho.nombre}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="inseminacion-tecnico">Técnico o veterinario</Label>
              <Input
                id="inseminacion-tecnico"
                value={values.tecnico}
                onChange={(event) => updateField("tecnico", event.target.value)}
                placeholder="Nombre del técnico"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="inseminacion-observaciones">Observaciones</Label>
              <Textarea
                id="inseminacion-observaciones"
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
              {isEdit ? "Guardar cambios" : "Registrar inseminación"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
