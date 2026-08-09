"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LogoUploader } from "@/features/configuracion/components/logo-uploader";
import { SettingsSection } from "@/features/configuracion/components/settings-section";
import type { FincaRow } from "@/features/configuracion/types";
import { fincaToFormValues, validateFincaInfoForm, type FincaInfoFormErrors, type FincaInfoFormValues } from "@/features/configuracion/validations/finca.schema";
import { createClient } from "@/lib/supabase/client";
import { fincaLogoStorage } from "@/services/storage.service";
import { fincaService } from "@/services/finca.service";

export function FarmInformationSettings({ finca }: { finca: FincaRow }) {
  const router = useRouter();
  const [values, setValues] = useState<FincaInfoFormValues>(() => fincaToFormValues(finca));
  const [errors, setErrors] = useState<FincaInfoFormErrors>({});
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(finca.logo_url);
  const [logoRemovido, setLogoRemovido] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  function updateField<K extends keyof FincaInfoFormValues>(key: K, value: FincaInfoFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function handleSelectLogo(file: File) {
    setLogoFile(file);
    setLogoRemovido(false);
    setLogoPreview(URL.createObjectURL(file));
  }

  function handleRemoveLogo() {
    setLogoFile(null);
    setLogoPreview(null);
    setLogoRemovido(true);
  }

  async function handleSave() {
    const fieldErrors = validateFincaInfoForm(values);
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      toast.error("Revisa los campos marcados");
      return;
    }

    setIsSaving(true);
    const supabase = createClient();

    try {
      let logoUrl = finca.logo_url;

      if (logoFile) {
        logoUrl = await fincaLogoStorage.upload(logoFile, finca.id);
        await fincaLogoStorage.remove(finca.logo_url);
      } else if (logoRemovido) {
        await fincaLogoStorage.remove(finca.logo_url);
        logoUrl = null;
      }

      await fincaService.update(supabase, finca.id, {
        nombre: values.nombre.trim(),
        propietario: values.propietario?.trim() || null,
        telefono: values.telefono?.trim() || null,
        correo: values.correo?.trim() || null,
        direccion: values.direccion?.trim() || null,
        provincia: values.provincia?.trim() || null,
        canton: values.canton?.trim() || null,
        distrito: values.distrito?.trim() || null,
        descripcion: values.descripcion?.trim() || null,
        logo_url: logoUrl,
      });

      toast.success("Configuración actualizada correctamente.");
      setLogoFile(null);
      setLogoRemovido(false);
      router.refresh();
    } catch {
      toast.error("No se pudieron guardar los cambios.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <SettingsSection
      title="Información de la finca"
      description="Datos generales y de contacto que se muestran en el Dashboard y en los reportes."
      onSave={handleSave}
      isSaving={isSaving}
    >
      <LogoUploader previewUrl={logoPreview} onSelect={handleSelectLogo} onRemove={handleRemoveLogo} disabled={isSaving} />

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="finca-nombre">Nombre de la finca *</Label>
          <Input
            id="finca-nombre"
            value={values.nombre}
            onChange={(event) => updateField("nombre", event.target.value)}
            disabled={isSaving}
            aria-invalid={Boolean(errors.nombre)}
          />
          {errors.nombre && <p className="text-xs text-destructive">{errors.nombre}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="finca-propietario">Propietario</Label>
          <Input id="finca-propietario" value={values.propietario} onChange={(event) => updateField("propietario", event.target.value)} disabled={isSaving} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="finca-telefono">Teléfono</Label>
          <Input
            id="finca-telefono"
            value={values.telefono}
            onChange={(event) => updateField("telefono", event.target.value)}
            placeholder="Ej. +506 8888-8888"
            disabled={isSaving}
            aria-invalid={Boolean(errors.telefono)}
          />
          {errors.telefono && <p className="text-xs text-destructive">{errors.telefono}</p>}
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="finca-correo">Correo electrónico</Label>
          <Input
            id="finca-correo"
            type="email"
            value={values.correo}
            onChange={(event) => updateField("correo", event.target.value)}
            placeholder="contacto@finca.com"
            disabled={isSaving}
            aria-invalid={Boolean(errors.correo)}
          />
          {errors.correo && <p className="text-xs text-destructive">{errors.correo}</p>}
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="finca-direccion">Dirección</Label>
          <Input id="finca-direccion" value={values.direccion} onChange={(event) => updateField("direccion", event.target.value)} disabled={isSaving} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="finca-provincia">Provincia</Label>
          <Input id="finca-provincia" value={values.provincia} onChange={(event) => updateField("provincia", event.target.value)} disabled={isSaving} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="finca-canton">Cantón</Label>
          <Input id="finca-canton" value={values.canton} onChange={(event) => updateField("canton", event.target.value)} disabled={isSaving} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="finca-distrito">Distrito</Label>
          <Input id="finca-distrito" value={values.distrito} onChange={(event) => updateField("distrito", event.target.value)} disabled={isSaving} />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="finca-descripcion">Descripción</Label>
          <Textarea
            id="finca-descripcion"
            value={values.descripcion}
            onChange={(event) => updateField("descripcion", event.target.value)}
            placeholder="Breve descripción de la finca..."
            rows={3}
            disabled={isSaving}
          />
        </div>
      </div>
    </SettingsSection>
  );
}
