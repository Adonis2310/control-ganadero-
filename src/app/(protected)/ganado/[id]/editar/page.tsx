import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AnimalForm } from "@/features/ganado/components/animal-form";
import { createClient } from "@/lib/supabase/server";
import { animalesService } from "@/services/animales.service";
import { razasService } from "@/services/razas.service";

export const metadata: Metadata = { title: "Editar animal | Control Ganadero" };

interface EditarAnimalPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditarAnimalPage({ params }: EditarAnimalPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const [animal, razas] = await Promise.all([
    animalesService.getById(supabase, id),
    razasService.list(supabase),
  ]);

  if (!animal) {
    notFound();
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Editar {animal.nombre || animal.identificador}
        </h1>
        <p className="text-sm text-muted-foreground">
          Actualiza la información del animal.
        </p>
      </div>

      <AnimalForm
        mode="edit"
        fincaId={animal.finca_id}
        razas={razas}
        animal={animal}
      />
    </div>
  );
}
