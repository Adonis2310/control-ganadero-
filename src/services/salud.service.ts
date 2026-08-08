import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database.types";
import type { AnimalRef, HealthDashboardAlerts, RegistroSalud } from "@/features/ganado/types";
import { adjuntarAnimales, calcularEstadoAplicacion, construirTimelineAnimal } from "@/features/ganado/utils/salud.utils";
import { desparasitacionesService } from "@/services/desparasitaciones.service";
import { enfermedadesService } from "@/services/enfermedades.service";
import { tratamientosService } from "@/services/tratamientos.service";
import { vacunasService } from "@/services/vacunas.service";

type SupabaseDb = SupabaseClient<Database>;

const ALERTAS_VACIAS: HealthDashboardAlerts = {
  vacunasProximas: 0,
  vacunasVencidas: 0,
  desparasitacionesProximas: 0,
  desparasitacionesVencidas: 0,
  animalesConEnfermedadActiva: 0,
};

async function listAnimalesFinca(supabase: SupabaseDb, fincaId: string): Promise<AnimalRef[]> {
  const { data, error } = await supabase
    .from("animales")
    .select("id, identificador, nombre")
    .eq("finca_id", fincaId);

  if (error) throw error;
  return data ?? [];
}

export const saludService = {
  /** Alertas sanitarias agregadas de toda la finca, mostradas en el Dashboard. */
  async getDashboardAlerts(supabase: SupabaseDb, fincaId: string): Promise<HealthDashboardAlerts> {
    const animales = await listAnimalesFinca(supabase, fincaId);
    const ids = animales.map((a) => a.id);
    if (ids.length === 0) return ALERTAS_VACIAS;

    const [vacunas, desparasitaciones, enfermedades] = await Promise.all([
      vacunasService.listForFinca(supabase, ids),
      desparasitacionesService.listForFinca(supabase, ids),
      enfermedadesService.listForFinca(supabase, ids),
    ]);

    const estadosVacunas = vacunas.map((v) => calcularEstadoAplicacion(v.proxima_aplicacion));
    const estadosDesparasitaciones = desparasitaciones.map((d) =>
      calcularEstadoAplicacion(d.proxima_aplicacion),
    );

    return {
      vacunasProximas: estadosVacunas.filter((e) => e === "proxima").length,
      vacunasVencidas: estadosVacunas.filter((e) => e === "vencida").length,
      desparasitacionesProximas: estadosDesparasitaciones.filter((e) => e === "proxima").length,
      desparasitacionesVencidas: estadosDesparasitaciones.filter((e) => e === "vencida").length,
      animalesConEnfermedadActiva: new Set(
        enfermedades.filter((e) => e.estado === "activa").map((e) => e.animal_id),
      ).size,
    };
  },

  /** Todos los registros sanitarios de la finca, con el animal resuelto (página general /salud). */
  async listRegistrosFinca(supabase: SupabaseDb, fincaId: string): Promise<RegistroSalud[]> {
    const animales = await listAnimalesFinca(supabase, fincaId);
    const ids = animales.map((a) => a.id);
    if (ids.length === 0) return [];

    const [vacunas, desparasitaciones, enfermedades, tratamientos] = await Promise.all([
      vacunasService.listForFinca(supabase, ids),
      desparasitacionesService.listForFinca(supabase, ids),
      enfermedadesService.listForFinca(supabase, ids),
      tratamientosService.listForFinca(supabase, ids),
    ]);

    const registros = construirTimelineAnimal(vacunas, desparasitaciones, enfermedades, tratamientos);
    const animalPorId = new Map(animales.map((a) => [a.id, a]));
    return adjuntarAnimales(registros, animalPorId);
  },
};
