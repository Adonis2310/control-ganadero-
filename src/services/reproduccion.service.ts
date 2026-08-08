import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database.types";
import type { EventoReproductivoRow, GestacionRow } from "@/features/ganado/types";
import { calcularFechaEstimadaParto } from "@/features/ganado/utils/reproduccion.utils";
import { eventosReproductivosService } from "@/services/eventos-reproductivos.service";
import { gestacionesService } from "@/services/gestaciones.service";

type SupabaseDb = SupabaseClient<Database>;

async function asegurarGestacionEnSeguimiento(
  supabase: SupabaseDb,
  animalId: string,
  fecha: string,
  machoId: string | null,
  metodoConcepcion: "monta_natural" | "monta_controlada" | "inseminacion_artificial",
): Promise<void> {
  const activa = await gestacionesService.getActivaByAnimal(supabase, animalId);
  if (activa) return; // ya hay un ciclo en curso; no se crea uno nuevo por cada monta/inseminación.

  await gestacionesService.create(supabase, {
    animal_id: animalId,
    fecha_inicio: fecha,
    estado: "en_seguimiento",
    metodo_concepcion: metodoConcepcion,
    macho_id: machoId,
  });
}

export const reproduccionService = {
  async registrarCelo(
    supabase: SupabaseDb,
    animalId: string,
    values: { fecha: string; observaciones: string | null },
  ): Promise<EventoReproductivoRow> {
    return eventosReproductivosService.create(supabase, {
      animal_id: animalId,
      tipo: "celo",
      fecha: values.fecha,
      observaciones: values.observaciones,
    });
  },

  async registrarMonta(
    supabase: SupabaseDb,
    animalId: string,
    values: {
      fecha: string;
      machoId: string;
      tipoMonta: "natural" | "controlada";
      observaciones: string | null;
    },
  ): Promise<EventoReproductivoRow> {
    await asegurarGestacionEnSeguimiento(
      supabase,
      animalId,
      values.fecha,
      values.machoId,
      values.tipoMonta === "natural" ? "monta_natural" : "monta_controlada",
    );

    return eventosReproductivosService.create(supabase, {
      animal_id: animalId,
      tipo: "monta",
      fecha: values.fecha,
      macho_id: values.machoId,
      tipo_monta: values.tipoMonta,
      observaciones: values.observaciones,
    });
  },

  async registrarInseminacion(
    supabase: SupabaseDb,
    animalId: string,
    values: {
      fecha: string;
      metodo: string | null;
      identificacionSemen: string | null;
      machoId: string | null;
      tecnico: string | null;
      observaciones: string | null;
    },
  ): Promise<EventoReproductivoRow> {
    await asegurarGestacionEnSeguimiento(
      supabase,
      animalId,
      values.fecha,
      values.machoId,
      "inseminacion_artificial",
    );

    return eventosReproductivosService.create(supabase, {
      animal_id: animalId,
      tipo: "inseminacion",
      fecha: values.fecha,
      macho_id: values.machoId,
      metodo_inseminacion: values.metodo,
      identificacion_semen: values.identificacionSemen,
      veterinario: values.tecnico,
      observaciones: values.observaciones,
    });
  },

  async registrarDiagnostico(
    supabase: SupabaseDb,
    animalId: string,
    values: {
      fecha: string;
      resultado: "positivo" | "negativo";
      metodo: string | null;
      veterinario: string | null;
      observaciones: string | null;
    },
  ): Promise<EventoReproductivoRow> {
    const activa = await gestacionesService.getActivaByAnimal(supabase, animalId);
    let gestacionId: string | null = null;

    if (values.resultado === "positivo") {
      if (activa) {
        await gestacionesService.update(supabase, activa.id, {
          fecha_diagnostico: values.fecha,
          estado: "confirmada",
          fecha_estimada_parto:
            activa.fecha_estimada_parto ?? calcularFechaEstimadaParto(activa.fecha_inicio),
        });
        gestacionId = activa.id;
      } else {
        const creada = await gestacionesService.create(supabase, {
          animal_id: animalId,
          fecha_inicio: values.fecha,
          fecha_diagnostico: values.fecha,
          estado: "confirmada",
          fecha_estimada_parto: calcularFechaEstimadaParto(values.fecha),
          metodo_concepcion: "desconocido",
        });
        gestacionId = creada.id;
      }
    } else if (activa && activa.estado === "en_seguimiento") {
      // Diagnóstico negativo sobre un ciclo aún no confirmado: no se mantiene una gestación activa.
      await gestacionesService.remove(supabase, activa.id);
    }

    return eventosReproductivosService.create(supabase, {
      animal_id: animalId,
      tipo: "diagnostico",
      fecha: values.fecha,
      resultado_diagnostico: values.resultado,
      metodo_diagnostico: values.metodo,
      veterinario: values.veterinario,
      gestacion_id: gestacionId,
      observaciones: values.observaciones,
    });
  },

  async registrarParto(
    supabase: SupabaseDb,
    animalId: string,
    values: {
      fecha: string;
      numeroCrias: number;
      estadoParto: "normal" | "complicaciones";
      observaciones: string | null;
    },
  ): Promise<{ evento: EventoReproductivoRow; gestacion: GestacionRow }> {
    const activa = await gestacionesService.getActivaByAnimal(supabase, animalId);
    let gestacion: GestacionRow;

    if (activa) {
      await gestacionesService.update(supabase, activa.id, {
        fecha_parto: values.fecha,
        estado: "finalizada",
      });
      gestacion = { ...activa, fecha_parto: values.fecha, estado: "finalizada" };
    } else {
      gestacion = await gestacionesService.create(supabase, {
        animal_id: animalId,
        fecha_inicio: values.fecha,
        fecha_parto: values.fecha,
        fecha_estimada_parto: values.fecha,
        estado: "finalizada",
        metodo_concepcion: "desconocido",
      });
    }

    const evento = await eventosReproductivosService.create(supabase, {
      animal_id: animalId,
      tipo: "parto",
      fecha: values.fecha,
      numero_crias: values.numeroCrias,
      estado_parto: values.estadoParto,
      gestacion_id: gestacion.id,
      observaciones: values.observaciones,
    });

    return { evento, gestacion };
  },

  async registrarAborto(
    supabase: SupabaseDb,
    animalId: string,
    values: {
      fecha: string;
      gestacionId: string | null;
      motivo: string | null;
      veterinario: string | null;
      observaciones: string | null;
    },
  ): Promise<EventoReproductivoRow> {
    const activa = await gestacionesService.getActivaByAnimal(supabase, animalId);
    const gestacionId = values.gestacionId || activa?.id || null;

    if (gestacionId) {
      await gestacionesService.update(supabase, gestacionId, { estado: "abortada" });
    }

    return eventosReproductivosService.create(supabase, {
      animal_id: animalId,
      tipo: "aborto",
      fecha: values.fecha,
      motivo_aborto: values.motivo,
      veterinario: values.veterinario,
      gestacion_id: gestacionId,
      observaciones: values.observaciones,
    });
  },
};
