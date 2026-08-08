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
