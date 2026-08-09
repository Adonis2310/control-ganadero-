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
import { Textarea } from "@/components/ui/textarea";
import { AnimalParentSelect } from "@/features/ganado/components/animal-parent-select";
import { ActivityTypeSelect } from "@/features/calendario/components/activity-type-select";
import { PRIORIDAD_ACTIVIDAD_OPTIONS, RECURRENCIA_OPTIONS, type ActividadConAnimal } from "@/features/calendario/types";
import {
  EMPTY_ACTIVIDAD_FORM,
  validateActividadForm,
  type ActividadFormErrors,
  type ActividadFormValues,
} from "@/features/calendario/validations/actividad.schema";
import type { AnimalRef } from "@/features/ganado/types";
import { createClient } from "@/lib/supabase/client";
import { actividadesService } from "@/services/actividades.service";
import { fincaService } from "@/services/finca.service";

interface ActivityFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  actividad?: ActividadConAnimal | null;
  animales: AnimalRef[];
  onSaved: () => void;
  fincaId?: string;
}

function toFormValues(actividad?: ActividadConAnimal | null): ActividadFormValues {
  if (!actividad) return EMPTY_ACTIVIDAD_FORM;
  return {
    titulo: actividad.titulo,
    descripcion: actividad.descripcion ?? "",
    tipo: actividad.tipo,
    fecha: actividad.fecha,
    hora_inicio: actividad.hora_inicio ?? "",
    hora_fin: actividad.hora_fin ?? "",
    prioridad: actividad.prioridad,
    animal_id: actividad.animal_id ?? "",
    recurrencia: actividad.recurrencia,
  };
}

export function ActivityFormDialog({
  open,
  onOpenChange,
  mode,
  actividad,
  animales,
  onSaved,
  fincaId,
}: ActivityFormDialogProps) {
  const [values, setValues] = useState<ActividadFormValues>(EMPTY_ACTIVIDAD_FORM);
  const [errors, setErrors] = useState<ActividadFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // El diálogo es una única instancia reutilizada para crear y editar: hay que
  // resincronizar el formulario cada vez que el padre lo abre, porque React no
  // reinicializa el estado solo al cambiar props en un componente ya montado.
  useEffect(() => {
    if (open) {
      setValues(toFormValues(actividad));
      setErrors({});
    }
  }, [open, actividad]);

  function updateField<K extends keyof ActividadFormValues>(key: K, value: ActividadFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  async function handleSubmit() {
    const fieldErrors = validateActividadForm(values);
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      toast.error("Revisa los campos marcados", {
        description: "Hay datos incompletos o inválidos en el formulario.",
      });
      return;
    }

    setIsSubmitting(true);
    const supabase = createClient();

    try {
      const finca = fincaId ? { id: fincaId } : await fincaService.getOrCreate(supabase);

      const payload = {
        finca_id: finca.id,
        titulo: values.titulo.trim(),
        descripcion: values.descripcion?.trim() || null,
        tipo: values.tipo as ActividadConAnimal["tipo"],
        fecha: values.fecha,
        hora_inicio: values.hora_inicio?.trim() || null,
        hora_fin: values.hora_fin?.trim() || null,
        prioridad: values.prioridad as ActividadConAnimal["prioridad"],
        animal_id: values.animal_id?.trim() || null,
        recurrencia: (values.recurrencia?.trim() || "ninguna") as ActividadConAnimal["recurrencia"],
      };

      if (mode === "create") {
        await actividadesService.create(supabase, payload);
        toast.success("Actividad creada");
      } else {
        if (!actividad) return;
        await actividadesService.update(supabase, actividad.id, payload);
        toast.success("Cambios guardados");
      }
      onSaved();
      onOpenChange(false);
    } catch {
      toast.error("No se pudo guardar la actividad", { description: "Intenta nuevamente en unos segundos." });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] w-full max-w-lg overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Nueva actividad" : "Editar actividad"}</DialogTitle>
          <DialogDescription>Programa una tarea o evento del calendario ganadero.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="actividad-titulo">Título *</Label>
            <Input
              id="actividad-titulo"
              value={values.titulo}
              onChange={(event) => updateField("titulo", event.target.value)}
              placeholder="Ej. Vacunación anual"
              disabled={isSubmitting}
              aria-invalid={Boolean(errors.titulo)}
            />
            {errors.titulo && <p className="text-xs text-destructive">{errors.titulo}</p>}
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label>Tipo *</Label>
            <ActivityTypeSelect value={values.tipo} onChange={(value) => updateField("tipo", value)} disabled={isSubmitting} />
            {errors.tipo && <p className="text-xs text-destructive">{errors.tipo}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="actividad-fecha">Fecha *</Label>
            <Input
              id="actividad-fecha"
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
            <Select
              value={values.prioridad}
              onValueChange={(value) => updateField("prioridad", value ?? "media")}
              disabled={isSubmitting}
            >
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
            <Label htmlFor="actividad-hora-inicio">Hora de inicio</Label>
            <Input
              id="actividad-hora-inicio"
              type="time"
              value={values.hora_inicio}
              onChange={(event) => updateField("hora_inicio", event.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="actividad-hora-fin">Hora de finalización</Label>
            <Input
              id="actividad-hora-fin"
              type="time"
              value={values.hora_fin}
              onChange={(event) => updateField("hora_fin", event.target.value)}
              disabled={isSubmitting}
              aria-invalid={Boolean(errors.hora_fin)}
            />
            {errors.hora_fin && <p className="text-xs text-destructive">{errors.hora_fin}</p>}
          </div>

          <div className="space-y-2">
            <Label>Animal</Label>
            <AnimalParentSelect
              value={values.animal_id ?? ""}
              onChange={(value) => updateField("animal_id", value === "ninguno" ? "" : value)}
              options={animales}
              placeholder="Selecciona un animal"
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label>Repetición</Label>
            <Select
              value={values.recurrencia || "ninguna"}
              onValueChange={(value) => updateField("recurrencia", value ?? "ninguna")}
              disabled={isSubmitting}
            >
              <SelectTrigger className="w-full">
                <SelectValue>
                  {(current: string | null) =>
                    RECURRENCIA_OPTIONS.find((option) => option.value === current)?.label ?? "Sin repetición"
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {RECURRENCIA_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="actividad-descripcion">Descripción</Label>
            <Textarea
              id="actividad-descripcion"
              value={values.descripcion}
              onChange={(event) => updateField("descripcion", event.target.value)}
              placeholder="Notas adicionales sobre esta actividad..."
              disabled={isSubmitting}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="size-4 animate-spin" />}
            {mode === "create" ? "Crear actividad" : "Guardar cambios"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
