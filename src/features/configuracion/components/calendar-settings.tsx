"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SettingsSection } from "@/features/configuracion/components/settings-section";
import { PRIMER_DIA_SEMANA_OPTIONS, type ConfiguracionSistemaRow, type PrimerDiaSemana } from "@/features/configuracion/types";
import {
  sistemaToCalendarForm,
  validateCalendarSettingsForm,
  type CalendarSettingsFormErrors,
  type CalendarSettingsFormValues,
} from "@/features/configuracion/validations/sistema.schema";
import { createClient } from "@/lib/supabase/client";
import { configuracionSistemaService } from "@/services/configuracion-sistema.service";

export function CalendarSettings({ sistema }: { sistema: ConfiguracionSistemaRow }) {
  const router = useRouter();
  const [values, setValues] = useState<CalendarSettingsFormValues>(() => sistemaToCalendarForm(sistema));
  const [errors, setErrors] = useState<CalendarSettingsFormErrors>({});
  const [isSaving, setIsSaving] = useState(false);

  function updateField<K extends keyof CalendarSettingsFormValues>(key: K, value: CalendarSettingsFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  async function handleSave() {
    const fieldErrors = validateCalendarSettingsForm(values);
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      toast.error("Revisa los campos marcados");
      return;
    }

    setIsSaving(true);
    try {
      const supabase = createClient();
      await configuracionSistemaService.update(supabase, sistema.id, {
        primer_dia_semana: values.primer_dia_semana,
        horario_inicio: values.horario_inicio,
        horario_fin: values.horario_fin,
      });
      toast.success("Configuración actualizada correctamente.");
      router.refresh();
    } catch {
      toast.error("No se pudieron guardar los cambios.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <SettingsSection
      title="Calendario"
      description="Controla cómo se muestra el calendario. No impide registrar actividades fuera de este horario."
      onSave={handleSave}
      isSaving={isSaving}
    >
      <div className="grid gap-5 sm:grid-cols-3">
        <div className="space-y-2">
          <Label>Primer día de la semana</Label>
          <Select
            value={values.primer_dia_semana}
            onValueChange={(next) => updateField("primer_dia_semana", (next ?? "lunes") as PrimerDiaSemana)}
            disabled={isSaving}
          >
            <SelectTrigger className="w-full">
              <SelectValue>{() => PRIMER_DIA_SEMANA_OPTIONS.find((option) => option.value === values.primer_dia_semana)?.label ?? "Lunes"}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {PRIMER_DIA_SEMANA_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="horario-inicio">Hora inicial</Label>
          <Input
            id="horario-inicio"
            type="time"
            value={values.horario_inicio}
            onChange={(event) => updateField("horario_inicio", event.target.value)}
            disabled={isSaving}
            aria-invalid={Boolean(errors.horario_fin)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="horario-fin">Hora final</Label>
          <Input
            id="horario-fin"
            type="time"
            value={values.horario_fin}
            onChange={(event) => updateField("horario_fin", event.target.value)}
            disabled={isSaving}
            aria-invalid={Boolean(errors.horario_fin)}
          />
          {errors.horario_fin && <p className="text-xs text-destructive">{errors.horario_fin}</p>}
        </div>
      </div>
    </SettingsSection>
  );
}
