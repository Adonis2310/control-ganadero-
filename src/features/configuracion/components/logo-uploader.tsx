"use client";

import { useRef } from "react";
import { Building2, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { validarArchivoLogo } from "@/services/storage.service";

interface LogoUploaderProps {
  previewUrl: string | null;
  onSelect: (file: File) => void;
  onRemove: () => void;
  disabled?: boolean;
}

/**
 * Solo maneja la selección local del archivo (igual que `AnimalPhotoUpload`
 * en Ganado): la subida real a Supabase Storage ocurre al guardar la
 * sección "Información de la finca", junto con el resto de los campos.
 */
export function LogoUploader({ previewUrl, onSelect, onRemove, disabled }: LogoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const error = validarArchivoLogo(file);
    if (error) {
      toast.error("No se pudo seleccionar el logo", { description: error });
      return;
    }
    onSelect(file);
  }

  return (
    <div className="space-y-2">
      <Label>Logo de la finca</Label>
      <div className="flex items-center gap-4">
        <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted">
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- previsualización de un archivo local o URL de Supabase Storage, no una imagen estática del sitio.
            <img src={previewUrl} alt="Logo de la finca" className="size-full object-cover" />
          ) : (
            <Building2 className="size-6 text-muted-foreground" />
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()} disabled={disabled}>
              {previewUrl ? "Cambiar logo" : "Subir logo"}
            </Button>
            {previewUrl && (
              <Button type="button" variant="ghost" size="sm" onClick={onRemove} disabled={disabled} className="text-muted-foreground">
                <X className="size-3.5" />
                Quitar
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground">PNG, JPG o WEBP. Máximo 2 MB.</p>
        </div>

        <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleFileChange} />
      </div>
    </div>
  );
}
