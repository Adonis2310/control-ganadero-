"use client";

import { useRef } from "react";
import { Camera, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { AnimalAvatar } from "@/features/ganado/components/animal-avatar";

interface AnimalPhotoUploadProps {
  previewUrl: string | null;
  nombre: string;
  identificador: string;
  onSelect: (file: File) => void;
  onRemove: () => void;
  disabled?: boolean;
}

export function AnimalPhotoUpload({
  previewUrl,
  nombre,
  identificador,
  onSelect,
  onRemove,
  disabled,
}: AnimalPhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) onSelect(file);
    event.target.value = "";
  }

  return (
    <div className="flex items-center gap-4">
      <div className="relative">
        <AnimalAvatar
          fotoUrl={previewUrl}
          nombre={nombre || null}
          identificador={identificador || "?"}
          size="lg"
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={disabled}
          aria-label="Subir fotografía"
          className="absolute -right-1 -bottom-1 flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm hover:bg-primary/80 disabled:opacity-50"
        >
          <Camera className="size-3.5" />
        </button>
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => inputRef.current?.click()}
            disabled={disabled}
          >
            {previewUrl ? "Cambiar fotografía" : "Subir fotografía"}
          </Button>
          {previewUrl && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onRemove}
              disabled={disabled}
              className="text-muted-foreground"
            >
              <X className="size-3.5" />
              Quitar
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          JPG o PNG. Se optimiza automáticamente al subir.
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
