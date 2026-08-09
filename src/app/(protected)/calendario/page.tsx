import type { Metadata } from "next";

import { CalendarExplorer } from "@/features/calendario/components/calendar-explorer";
import { combinarEventos, construirEventosReproduccion, construirEventosSalud } from "@/features/calendario/utils/actividad.utils";
import type { ActividadAnimalRef } from "@/features/calendario/types";
import { createClient } from "@/lib/supabase/server";
import { actividadesService } from "@/services/actividades.service";
import { animalesService } from "@/services/animales.service";
import { desparasitacionesService } from "@/services/desparasitaciones.service";
import { fincaService } from "@/services/finca.service";
import { gestacionesService } from "@/services/gestaciones.service";
import { vacunasService } from "@/services/vacunas.service";

export const metadata: Metadata = { title: "Calendario | Control Ganadero" };

export default async function CalendarioPage() {
  const supabase = await createClient();
  const finca = await fincaService.getOrCreate(supabase);

  const [actividades, animales, animalesConSexo] = await Promise.all([
    actividadesService.list(supabase, finca.id),
    animalesService.listAll(supabase, finca.id),
    animalesService.listAllConSexo(supabase, finca.id),
  ]);

  const animalIds = animalesConSexo.map((animal) => animal.id);
  const [vacunas, desparasitaciones, gestaciones] = await Promise.all([
    vacunasService.listForFinca(supabase, animalIds),
    desparasitacionesService.listForFinca(supabase, animalIds),
    gestacionesService.listForFinca(supabase, animalIds),
  ]);

  const animalPorId = new Map<string, ActividadAnimalRef>(
    animalesConSexo.map((animal) => [animal.id, { ...animal, raza: null }]),
  );

  const eventosDerivados = combinarEventos(
    construirEventosSalud(vacunas, desparasitaciones, animalPorId),
    construirEventosReproduccion(gestaciones, animalPorId),
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Calendario</h1>
        <p className="text-sm text-muted-foreground">
          Organiza, programa y da seguimiento a las actividades de la finca.
        </p>
      </div>

      <CalendarExplorer
        actividadesIniciales={actividades}
        eventosDerivados={eventosDerivados}
        animales={animales}
        fincaId={finca.id}
      />
    </div>
  );
}
