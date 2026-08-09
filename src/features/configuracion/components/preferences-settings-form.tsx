"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { CurrencySettings } from "@/features/configuracion/components/currency-settings";
import { NumberFormatSettings } from "@/features/configuracion/components/number-format-settings";
import { SettingsSection } from "@/features/configuracion/components/settings-section";
import { WeightSettings } from "@/features/configuracion/components/weight-settings";
import type { ConfiguracionSistemaRow } from "@/features/configuracion/types";
import { sistemaToPreferencesForm, validatePreferencesForm, type PreferencesFormErrors, type PreferencesFormValues } from "@/features/configuracion/validations/sistema.schema";
import { createClient } from "@/lib/supabase/client";
import { configuracionSistemaService } from "@/services/configuracion-sistema.service";

export function PreferencesSettingsForm({ sistema }: { sistema: ConfiguracionSistemaRow }) {
  const router = useRouter();
  const [values, setValues] = useState<PreferencesFormValues>(() => sistemaToPreferencesForm(sistema));
  const [errors, setErrors] = useState<PreferencesFormErrors>({});
  const [isSaving, setIsSaving] = useState(false);

  function updateField<K extends keyof PreferencesFormValues>(key: K, value: PreferencesFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  async function handleSave() {
    const fieldErrors = validatePreferencesForm(values);
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      toast.error("Revisa los campos marcados");
      return;
    }

    setIsSaving(true);
    try {
      const supabase = createClient();
      await configuracionSistemaService.update(supabase, sistema.id, {
        moneda: values.moneda,
        decimales: Number(values.decimales),
        unidad_peso: values.unidad_peso,
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
      title="Preferencias"
      description="Moneda, formato numérico y unidad de peso utilizados en todo el sistema."
      onSave={handleSave}
      isSaving={isSaving}
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <CurrencySettings value={values.moneda} onChange={(value) => updateField("moneda", value)} disabled={isSaving} />
        <NumberFormatSettings decimales={values.decimales} onChange={(value) => updateField("decimales", value)} disabled={isSaving} error={errors.decimales} />
        <WeightSettings value={values.unidad_peso} onChange={(value) => updateField("unidad_peso", value)} disabled={isSaving} />
      </div>
    </SettingsSection>
  );
}
