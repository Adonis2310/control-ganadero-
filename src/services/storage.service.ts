"use client";

import { createClient } from "@/lib/supabase/client";
import { optimizarImagen } from "@/features/ganado/utils/image.utils";

const BUCKET = "animales";

function extraerPathDesdeUrl(url: string): string | null {
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const index = url.indexOf(marker);
  if (index === -1) return null;
  return decodeURIComponent(url.slice(index + marker.length));
}

export const animalPhotoStorage = {
  /** Sube (u optimiza y sube) la foto de un animal y devuelve su URL pública. */
  async upload(file: File, animalId: string): Promise<string> {
    const supabase = createClient();
    const optimizado = await optimizarImagen(file);
    const extension = optimizado.type === "image/jpeg" ? "jpg" : file.name.split(".").pop() || "jpg";
    const path = `${animalId}/${Date.now()}.${extension}`;

    const { error } = await supabase.storage.from(BUCKET).upload(path, optimizado, {
      cacheControl: "3600",
      upsert: true,
    });

    if (error) throw error;

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return data.publicUrl;
  },

  /** Elimina una foto previa del bucket a partir de su URL pública. */
  async remove(url: string | null): Promise<void> {
    if (!url) return;
    const path = extraerPathDesdeUrl(url);
    if (!path) return;

    const supabase = createClient();
    await supabase.storage.from(BUCKET).remove([path]);
  },
};

// ----------------------------------------------------------------------------
// Logo de la finca (Fase 12)
// ----------------------------------------------------------------------------

const LOGO_BUCKET = "finca-logos";

export const LOGO_MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB
export const LOGO_TIPOS_PERMITIDOS = ["image/png", "image/jpeg", "image/webp"] as const;

export function validarArchivoLogo(file: File): string | null {
  if (!LOGO_TIPOS_PERMITIDOS.includes(file.type as (typeof LOGO_TIPOS_PERMITIDOS)[number])) {
    return "El logo debe ser una imagen PNG, JPG o WEBP.";
  }
  if (file.size > LOGO_MAX_SIZE_BYTES) {
    return "El logo no debe superar los 2 MB.";
  }
  return null;
}

function extraerPathLogoDesdeUrl(url: string): string | null {
  const marker = `/storage/v1/object/public/${LOGO_BUCKET}/`;
  const index = url.indexOf(marker);
  if (index === -1) return null;
  return decodeURIComponent(url.slice(index + marker.length));
}

export const fincaLogoStorage = {
  /** Sube (u optimiza y sube) el logo de la finca y devuelve su URL pública. */
  async upload(file: File, fincaId: string): Promise<string> {
    const error = validarArchivoLogo(file);
    if (error) throw new Error(error);

    const supabase = createClient();
    const optimizado = await optimizarImagen(file, 512);
    const extension = optimizado.type === "image/jpeg" ? "jpg" : file.name.split(".").pop() || "png";
    const path = `${fincaId}/${Date.now()}.${extension}`;

    const { error: uploadError } = await supabase.storage.from(LOGO_BUCKET).upload(path, optimizado, {
      cacheControl: "3600",
      upsert: true,
    });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from(LOGO_BUCKET).getPublicUrl(path);
    return data.publicUrl;
  },

  /** Elimina el logo anterior a partir de su URL pública. */
  async remove(url: string | null): Promise<void> {
    if (!url) return;
    const path = extraerPathLogoDesdeUrl(url);
    if (!path) return;

    const supabase = createClient();
    await supabase.storage.from(LOGO_BUCKET).remove([path]);
  },
};
