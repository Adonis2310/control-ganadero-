import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { AnimalDetailHeader } from "@/features/ganado/components/animal-detail-header";
import { AnimalDetailTabs } from "@/features/ganado/components/animal-detail-tabs";
import { createClient } from "@/lib/supabase/server";
import { animalesService } from "@/services/animales.service";
import { desparasitacionesService } from "@/services/desparasitaciones.service";
import { enfermedadesService } from "@/services/enfermedades.service";
import { eventosReproductivosService } from "@/services/eventos-reproductivos.service";
import { fincaService } from "@/services/finca.service";
import { gestacionesService } from "@/services/gestaciones.service";
import { pesosService } from "@/services/pesos.service";
import { razasService } from "@/services/razas.service";
import { tratamientosService } from "@/services/tratamientos.service";
import { vacunasService } from "@/services/vacunas.service";
import { ventasService } from "@/services/ventas.service";

interface AnimalDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: AnimalDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const animal = await animalesService.getById(supabase, id);
  return {
    title: animal
      ? `${animal.nombre || animal.identificador} | Control Ganadero`
      : "Animal no encontrado | Control Ganadero",
  };
}

export default async function AnimalDetailPage({ params }: AnimalDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const animal = await animalesService.getById(supabase, id);

  if (!animal) {
    notFound();
  }

  const [
    pesos,
    vacunas,
    desparasitaciones,
    enfermedades,
    tratamientos,
    finca,
    razas,
    eventosReproductivos,
    gestaciones,
    eventosComoMacho,
    crias,
    ventaInfo,
  ] = await Promise.all([
    pesosService.listByAnimal(supabase, animal.id),
    vacunasService.listByAnimal(supabase, animal.id),
    desparasitacionesService.listByAnimal(supabase, animal.id),
    enfermedadesService.listByAnimal(supabase, animal.id),
    tratamientosService.listByAnimal(supabase, animal.id),
    fincaService.getOrCreate(supabase),
    razasService.list(supabase),
    eventosReproductivosService.listByAnimal(supabase, animal.id),
    gestacionesService.listByAnimal(supabase, animal.id),
    eventosReproductivosService.listByMacho(supabase, animal.id),
    animalesService.listDescendientes(supabase, animal.id),
    ventasService.getVentaInfoPorAnimal(supabase, animal.id),
  ]);

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

      <AnimalDetailHeader animal={animal} />
      <AnimalDetailTabs
        animal={animal}
        fincaId={finca.id}
        razas={razas}
        pesos={pesos}
        vacunas={vacunas}
        desparasitaciones={desparasitaciones}
        enfermedades={enfermedades}
        tratamientos={tratamientos}
        eventosReproductivos={eventosReproductivos}
        gestaciones={gestaciones}
        eventosComoMacho={eventosComoMacho}
        crias={crias}
        ventaInfo={ventaInfo}
      />
    </div>
  );
}
