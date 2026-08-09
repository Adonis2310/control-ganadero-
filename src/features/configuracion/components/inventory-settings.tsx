"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SettingsSection } from "@/features/configuracion/components/settings-section";
import type { ConfiguracionSistemaRow } from "@/features/configuracion/types";
import {
  sistemaToInventoryForm,
  validateInventorySettingsForm,
  type InventorySettingsFormErrors,
  type InventorySettingsFormValues,
} from "@/features/configuracion/validations/sistema.schema";
import { createClient } from "@/lib/supabase/client";
import { configuracionSistemaService } from "@/services/configuracion-sistema.service";

export function InventorySettings({ sistema }: { sistema: ConfiguracionSistemaRow }) {
  const router = useRouter();
  const [values, setValues] = useState<InventorySettingsFormValues>(() => sistemaToInventoryForm(sistema));
  const [errors, setErrors] = useState<InventorySettingsFormErrors>({});
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave() {
    const fieldErrors = validateInventorySettingsForm(values);
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      toast.error("Revisa los campos marcados");
      return;
    }

    setIsSaving(true);
    try {
      const supabase = createClient();
      await configuracionSistemaService.update(supabase, sistema.id, {
        alerta_stock_bajo: Number(values.alerta_stock_bajo),
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
      title="Inventario"
      description="Umbral por defecto para las alertas de stock bajo. Los productos agotados (stock en 0) siempre generan alerta."
      onSave={handleSave}
      isSaving={isSaving}
    >
      <div className="max-w-xs space-y-2">
        <Label htmlFor="alerta-stock-bajo">Stock mínimo por defecto</Label>
        <Input
          id="alerta-stock-bajo"
          type="number"
          inputMode="decimal"
          min={0}
          step="0.01"
          value={values.alerta_stock_bajo}
          onChange={(event) => {
            setValues({ alerta_stock_bajo: event.target.value });
            setErrors({});
          }}
          disabled={isSaving}
          aria-invalid={Boolean(errors.alerta_stock_bajo)}
        />
        {errors.alerta_stock_bajo && <p className="text-xs text-destructive">{errors.alerta_stock_bajo}</p>}
        <p className="text-xs text-muted-foreground">
          Se usa como valor sugerido al registrar un producto nuevo. No modifica el stock mínimo de productos ya existentes.
        </p>
      </div>
    </SettingsSection>
  );
}
