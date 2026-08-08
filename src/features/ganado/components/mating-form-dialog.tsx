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
  EMPTY_MONTA_FORM,
  validateMontaForm,
  type MontaFormErrors,
  type MontaFormValues,
} from "@/features/ganado/validations/monta.schema";
import { createClient } from "@/lib/supabase/client";
import { animalesService } from "@/services/animales.service";
import { eventosReproductivosService } from "@/services/eventos-reproductivos.service";
import { reproduccionService } from "@/services/reproduccion.service";

const TIPO_MONTA_LABEL: Record<string, string> = {
  natural: "Monta natural",
  controlada: "Monta controlada",
};

interface MatingFormDialogProps {
  /** Id de la hembra dueña del evento. Si se registra desde la ficha de un macho, usar `contextoMacho` en su lugar. */
  animalId?: string;
  /** Registrar la monta desde la ficha de un macho: se fija el macho y se elige la hembra. */
  contextoMacho?: { machoId: string };
  fincaId: string;
  evento: EventoReproductivoRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

function toFormValues(evento: EventoReproductivoRow | null): MontaFormValues {
  if (!evento) return EMPTY_MONTA_FORM;
  return {
    fecha: evento.fecha,
    macho_id: evento.macho_id ?? "",
    tipo_monta: (evento.tipo_monta ?? "") as MontaFormValues["tipo_monta"],
    observaciones: evento.observaciones ?? "",
  };
}

export function MatingFormDialog({
  animalId,
  contextoMacho,
  fincaId,
  evento,
  open,
  onOpenChange,
  onSaved,
}: MatingFormDialogProps) {
  const modoDesdeMacho = Boolean(contextoMacho);
  const [values, setValues] = useState<MontaFormValues>(() => toFormValues(evento));
  const [errors, setErrors] = useState<MontaFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [opciones, setOpciones] = useState<AnimalRef[]>([]);
  const [hembraId, setHembraId] = useState("");
  const isEdit = evento !== null;

  useEffect(() => {
    if (open) {
      setValues(
        modoDesdeMacho ? { ...toFormValues(evento), macho_id: contextoMacho!.machoId } : toFormValues(evento),
      );
      setHembraId("");
      setErrors({});
      const supabase = createClient();
      animalesService
        .listForBreedingSelect(supabase, fincaId, modoDesdeMacho ? "hembra" : "macho")
        .then(setOpciones)
        .catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, evento, fincaId, modoDesdeMacho]);

  function updateField<K extends keyof MontaFormValues>(key: K, value: MontaFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const fieldErrors = validateMontaForm(
      modoDesdeMacho ? { ...values, macho_id: hembraId || "pendiente" } : values,
    );
    if (modoDesdeMacho && !hembraId) {
      fieldErrors.macho_id = "Selecciona la hembra.";
    }
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
          macho_id: values.macho_id,
          tipo_monta: values.tipo_monta,
          observaciones: values.observaciones?.trim() || null,
        });
        toast.success("Monta actualizada", { description: "Se guardaron los cambios." });
      } else {
        await reproduccionService.registrarMonta(
          supabase,
          modoDesdeMacho ? hembraId : animalId!,
          {
            fecha: values.fecha,
            machoId: modoDesdeMacho ? contextoMacho!.machoId : values.macho_id,
            tipoMonta: values.tipo_monta,
            observaciones: values.observaciones?.trim() || null,
          },
        );
        toast.success("Monta registrada", { description: "Se agregó al historial reproductivo." });
      }

      onSaved();
      onOpenChange(false);
    } catch (error) {
      const message = (error as { message?: string } | null)?.message;
      toast.error("No se pudo guardar el registro", {
        description:
          message && message.includes("macho")
            ? message
            : "Intenta nuevamente en unos segundos.",
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
            <DialogTitle>{isEdit ? "Editar monta" : "Registrar monta"}</DialogTitle>
            <DialogDescription>
              {isEdit
                ? "Actualiza los datos de esta monta."
                : "Registra una monta natural o controlada."}
            </DialogDescription>
          </DialogHeader>

          <div className="flex max-h-[60vh] flex-col gap-4 overflow-y-auto px-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="monta-fecha">Fecha *</Label>
              <Input
                id="monta-fecha"
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
              <Label htmlFor="monta-participante">{modoDesdeMacho ? "Hembra *" : "Macho *"}</Label>
              <Select
                value={(modoDesdeMacho ? hembraId : values.macho_id) || undefined}
                onValueChange={(next) => {
                  if (modoDesdeMacho) {
                    setHembraId(next ?? "");
                    setErrors((prev) => ({ ...prev, macho_id: undefined }));
                  } else {
                    updateField("macho_id", next ?? "");
                  }
                }}
                disabled={isSubmitting || opciones.length === 0}
              >
                <SelectTrigger
                  id="monta-participante"
                  className="w-full"
                  aria-invalid={Boolean(errors.macho_id)}
                >
                  <SelectValue
                    placeholder={
                      opciones.length === 0
                        ? modoDesdeMacho
                          ? "No hay hembras activas"
                          : "No hay machos activos"
                        : modoDesdeMacho
                          ? "Selecciona la hembra"
                          : "Selecciona el macho"
                    }
                  >
                    {(current: string | null) => {
                      const option = opciones.find((o) => o.id === current);
                      if (!option) return modoDesdeMacho ? "Selecciona la hembra" : "Selecciona el macho";
                      return option.nombre ? `${option.identificador} — ${option.nombre}` : option.identificador;
                    }}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {opciones.map((opcion) => (
                    <SelectItem key={opcion.id} value={opcion.id}>
                      {opcion.identificador}
                      {opcion.nombre ? ` — ${opcion.nombre}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.macho_id && <p className="text-xs text-destructive">{errors.macho_id}</p>}
              {opciones.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  {modoDesdeMacho
                    ? "No hay animales hembra activos registrados en la finca."
                    : "No hay animales machos activos registrados en la finca."}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="monta-tipo">Tipo de monta *</Label>
              <Select
                value={values.tipo_monta || undefined}
                onValueChange={(next) =>
                  updateField("tipo_monta", (next ?? "") as MontaFormValues["tipo_monta"])
                }
                disabled={isSubmitting}
              >
                <SelectTrigger id="monta-tipo" className="w-full" aria-invalid={Boolean(errors.tipo_monta)}>
                  <SelectValue placeholder="Selecciona el tipo">
                    {(current: string | null) => (current ? TIPO_MONTA_LABEL[current] : "Selecciona el tipo")}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="natural">Monta natural</SelectItem>
                  <SelectItem value="controlada">Monta controlada</SelectItem>
                </SelectContent>
              </Select>
              {errors.tipo_monta && <p className="text-xs text-destructive">{errors.tipo_monta}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="monta-observaciones">Observaciones</Label>
              <Textarea
                id="monta-observaciones"
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
              {isEdit ? "Guardar cambios" : "Registrar monta"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
