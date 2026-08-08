import type { Metadata } from "next";

import { AnimalForm } from "@/features/ganado/components/animal-form";
import { createClient } from "@/lib/supabase/server";
import { fincaService } from "@/services/finca.service";
import { razasService } from "@/services/razas.service";

export const metadata: Metadata = { title: "Agregar animal | Control Ganadero" };

export default async function NuevoAnimalPage() {
  const supabase = await createClient();
  const finca = await fincaService.getOrCreate(supabase);
  const razas = await razasService.list(supabase);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Agregar animal</h1>
        <p className="text-sm text-muted-foreground">
          Registra un nuevo animal en tu finca.
        </p>
      </div>

      <AnimalForm mode="create" fincaId={finca.id} razas={razas} />
    </div>
  );
}
