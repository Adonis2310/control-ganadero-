import type { Metadata } from "next";
import Link from "next/link";
import { HeartHandshake, HeartPulse, Plus, Scale } from "lucide-react";

import { Button } from "@/components/ui/button";
import { AnimalExplorer } from "@/features/ganado/components/animal-explorer";
import type { AnimalStats } from "@/features/ganado/types";
import { createClient } from "@/lib/supabase/server";
import { animalesService } from "@/services/animales.service";
import { fincaService } from "@/services/finca.service";
import { razasService } from "@/services/razas.service";

export const metadata: Metadata = { title: "Ganado | Control Ganadero" };

export default async function GanadoPage() {
  const supabase = await createClient();
  const finca = await fincaService.getOrCreate(supabase);
  const [animales, razas] = await Promise.all([
    animalesService.list(supabase, finca.id),
    razasService.list(supabase),
  ]);

  const stats: AnimalStats = {
    total: animales.length,
    hembras: animales.filter((animal) => animal.sexo === "hembra").length,
    machos: animales.filter((animal) => animal.sexo === "macho").length,
    activos: animales.filter((animal) => animal.estado === "activo").length,
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Ganado</h1>
          <p className="text-sm text-muted-foreground">
            Registra y administra todos los animales de tu finca.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href="/ganado/peso" />}
          >
            <Scale className="size-4" />
            Control de Peso
          </Button>
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href="/salud" />}
          >
            <HeartPulse className="size-4" />
            Salud
          </Button>
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href="/reproduccion" />}
          >
            <HeartHandshake className="size-4" />
            Reproducción
          </Button>
          <Button nativeButton={false} render={<Link href="/ganado/nuevo" />}>
            <Plus className="size-4" />
            Agregar animal
          </Button>
        </div>
      </div>

      <AnimalExplorer
        animalesIniciales={animales}
        razas={razas}
        stats={stats}
      />
    </div>
  );
}
