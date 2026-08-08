import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ReproduccionGeneralExplorer } from "@/features/ganado/components/reproduccion-general-explorer";
import { construirDatosGenerales } from "@/features/ganado/utils/reproduccion.utils";
import { createClient } from "@/lib/supabase/server";
import { animalesService } from "@/services/animales.service";
import { eventosReproductivosService } from "@/services/eventos-reproductivos.service";
import { fincaService } from "@/services/finca.service";
import { gestacionesService } from "@/services/gestaciones.service";

export const metadata: Metadata = { title: "Reproducción | Control Ganadero" };

export default async function ReproduccionGeneralPage() {
  const supabase = await createClient();
  const finca = await fincaService.getOrCreate(supabase);
  const animales = await animalesService.listAllConSexo(supabase, finca.id);
  const animalIds = animales.map((a) => a.id);

  const [gestaciones, eventos] = await Promise.all([
    gestacionesService.listForFinca(supabase, animalIds),
    eventosReproductivosService.listForFinca(supabase, animalIds),
  ]);

  const datos = construirDatosGenerales(animales, gestaciones, eventos);

  return (
    <div className="flex flex-col gap-6">
      <Button
        variant="ghost"
        size="sm"
        nativeButton={false}
        render={<Link href="/ganado" />}
        className="w-fit text-muted-foreground"
      >
        <ArrowLeft className="size-4" />
        Volver a Ganado
      </Button>

      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Reproducción</h1>
        <p className="text-sm text-muted-foreground">
          Consulta el estado reproductivo de toda la finca.
        </p>
      </div>

      <ReproduccionGeneralExplorer datos={datos} animales={animales} />
    </div>
  );
}
