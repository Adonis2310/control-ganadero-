import type {
  AnimalRef,
  AnimalReproductivo,
  EstadoGestacion,
  EstadoReproductivoHembra,
  EstadoReproductivoMacho,
  EventoRecienteFinca,
  EventoReproductivoRow,
  GestacionActivaFinca,
  GestacionRow,
  ProximoParto,
  RegistroReproductivo,
  ReproduccionGeneralStats,
  ReproductiveSummaryHembra,
  ReproductiveSummaryMacho,
  SexoAnimal,
} from "@/features/ganado/types";
import { TIPO_EVENTO_REPRODUCTIVO_LABEL } from "@/features/ganado/types";

/** Duración promedio de la gestación bovina, en días. Es una referencia, no una garantía veterinaria. */
export const DURACION_GESTACION_DIAS = 283;

/** Días de anticipación a partir de los cuales una gestación confirmada se considera "próxima a parto". */
const UMBRAL_PROXIMO_PARTO_DIAS = 15;

/** Días tras un parto/aborto durante los cuales la hembra se considera "recuperándose". */
const VENTANA_RECUPERACION_DIAS = 45;

/** Días tras un celo durante los cuales sigue considerándose "en celo" (ciclo estral típico). */
const VENTANA_CELO_DIAS = 3;

/** Días tras una monta durante los cuales un macho se considera "activo" como reproductor. */
const VENTANA_MACHO_ACTIVO_DIAS = 60;

function hoyISO(): string {
  return new Date().toISOString().split("T")[0];
}

function diasEntre(desde: string, hasta: string): number {
  const a = new Date(`${desde}T00:00:00`);
  const b = new Date(`${hasta}T00:00:00`);
  return Math.round((b.getTime() - a.getTime()) / 86_400_000);
}

/** Fecha estimada de parto a partir de la fecha de referencia de concepción (monta/inseminación/diagnóstico). Es una estimación, no un dato clínico exacto. */
export function calcularFechaEstimadaParto(fechaInicio: string): string {
  const inicio = new Date(`${fechaInicio}T00:00:00`);
  inicio.setDate(inicio.getDate() + DURACION_GESTACION_DIAS);
  return inicio.toISOString().split("T")[0];
}

/** Días restantes hasta la fecha estimada de parto (negativo si ya se superó). */
export function diasRestantesParto(fechaEstimadaParto: string): number {
  return diasEntre(hoyISO(), fechaEstimadaParto);
}

export type AlertaParto = "proximo" | "hoy" | "superado" | null;

export function calcularAlertaParto(gestacion: GestacionRow): AlertaParto {
  if (gestacion.estado !== "confirmada" || !gestacion.fecha_estimada_parto) return null;
  const dias = diasRestantesParto(gestacion.fecha_estimada_parto);
  if (dias === 0) return "hoy";
  if (dias < 0) return "superado";
  if (dias <= UMBRAL_PROXIMO_PARTO_DIAS) return "proximo";
  return null;
}

const GESTACIONES_ACTIVAS: EstadoGestacion[] = ["en_seguimiento", "confirmada"];

/** Estado reproductivo calculado de una hembra, en orden de prioridad (sin estados contradictorios). */
export function calcularEstadoReproductivoHembra(
  gestaciones: GestacionRow[],
  eventos: EventoReproductivoRow[],
): EstadoReproductivoHembra {
  if (gestaciones.length === 0 && eventos.length === 0) return "sin_informacion";

  const gestacionActiva = [...gestaciones]
    .filter((g) => GESTACIONES_ACTIVAS.includes(g.estado))
    .sort((a, b) => b.fecha_inicio.localeCompare(a.fecha_inicio))[0];

  if (gestacionActiva) {
    if (gestacionActiva.estado === "confirmada") {
      if (gestacionActiva.fecha_estimada_parto) {
        const dias = diasRestantesParto(gestacionActiva.fecha_estimada_parto);
        if (dias <= UMBRAL_PROXIMO_PARTO_DIAS) return "proxima_a_parto";
      }
      return "gestante";
    }
    return "servida";
  }

  const ultimoEventoFinal = [...eventos]
    .filter((e) => e.tipo === "parto" || e.tipo === "aborto")
    .sort((a, b) => b.fecha.localeCompare(a.fecha))[0];
  if (ultimoEventoFinal && diasEntre(ultimoEventoFinal.fecha, hoyISO()) <= VENTANA_RECUPERACION_DIAS) {
    return "recuperandose";
  }

  const ultimoCelo = [...eventos]
    .filter((e) => e.tipo === "celo")
    .sort((a, b) => b.fecha.localeCompare(a.fecha))[0];
  if (ultimoCelo && diasEntre(ultimoCelo.fecha, hoyISO()) <= VENTANA_CELO_DIAS) {
    return "en_celo";
  }

  return "disponible";
}

/** Estado reproductivo calculado de un macho, a partir de sus montas registradas como reproductor. */
export function calcularEstadoReproductivoMacho(
  montasComoMacho: EventoReproductivoRow[],
): EstadoReproductivoMacho {
  if (montasComoMacho.length === 0) return "sin_informacion";
  const ultima = [...montasComoMacho].sort((a, b) => b.fecha.localeCompare(a.fecha))[0];
  return diasEntre(ultima.fecha, hoyISO()) <= VENTANA_MACHO_ACTIVO_DIAS ? "activo" : "disponible";
}

export const ESTADO_REPRODUCTIVO_HEMBRA_LABEL: Record<EstadoReproductivoHembra, string> = {
  disponible: "Disponible",
  en_celo: "En celo",
  servida: "Servida",
  gestante: "Gestante",
  proxima_a_parto: "Próxima a parto",
  recuperandose: "Recuperándose",
  sin_informacion: "Sin información",
};

export const ESTADO_REPRODUCTIVO_HEMBRA_BADGE_CLASS: Record<EstadoReproductivoHembra, string> = {
  disponible: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300",
  en_celo: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
  servida: "bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300",
  gestante: "bg-violet-100 text-violet-800 dark:bg-violet-500/15 dark:text-violet-300",
  proxima_a_parto: "bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-500/15 dark:text-fuchsia-300",
  recuperandose: "bg-orange-100 text-orange-800 dark:bg-orange-500/15 dark:text-orange-300",
  sin_informacion: "bg-muted text-muted-foreground",
};

export const ESTADO_REPRODUCTIVO_MACHO_LABEL: Record<EstadoReproductivoMacho, string> = {
  activo: "Activo",
  disponible: "Disponible",
  sin_informacion: "Sin información",
};

export const ESTADO_REPRODUCTIVO_MACHO_BADGE_CLASS: Record<EstadoReproductivoMacho, string> = {
  activo: "bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300",
  disponible: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300",
  sin_informacion: "bg-muted text-muted-foreground",
};

export const ESTADO_GESTACION_LABEL: Record<EstadoGestacion, string> = {
  en_seguimiento: "En seguimiento",
  confirmada: "Confirmada",
  finalizada: "Finalizada",
  abortada: "Abortada",
};

export const ESTADO_GESTACION_BADGE_CLASS: Record<EstadoGestacion, string> = {
  en_seguimiento: "bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300",
  confirmada: "bg-violet-100 text-violet-800 dark:bg-violet-500/15 dark:text-violet-300",
  finalizada: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300",
  abortada: "bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300",
};

function tituloYDetalle(evento: EventoReproductivoRow): { titulo: string; detalle: string | null } {
  switch (evento.tipo) {
    case "celo":
      return { titulo: "Celo detectado", detalle: evento.observaciones };
    case "monta":
      return {
        titulo: `Monta ${evento.tipo_monta === "controlada" ? "controlada" : "natural"} registrada`,
        detalle: evento.observaciones,
      };
    case "inseminacion":
      return { titulo: "Inseminación artificial", detalle: evento.observaciones };
    case "diagnostico":
      return {
        titulo: `Diagnóstico ${evento.resultado_diagnostico === "positivo" ? "positivo" : "negativo"}`,
        detalle: evento.observaciones,
      };
    case "parto":
      return {
        titulo:
          evento.numero_crias && evento.numero_crias > 1
            ? `Parto registrado (${evento.numero_crias} crías)`
            : "Parto registrado",
        detalle: evento.observaciones,
      };
    case "aborto":
      return { titulo: "Aborto registrado", detalle: evento.motivo_aborto ?? evento.observaciones };
  }
}

function tonoEvento(evento: EventoReproductivoRow): RegistroReproductivo["estadoTono"] {
  switch (evento.tipo) {
    case "celo":
      return "atencion";
    case "diagnostico":
      return evento.resultado_diagnostico === "positivo" ? "positivo" : "neutral";
    case "parto":
      return "positivo";
    case "aborto":
      return "negativo";
    default:
      return "neutral";
  }
}

export function construirTimelineReproductivo(eventos: EventoReproductivoRow[]): RegistroReproductivo[] {
  return [...eventos]
    .sort((a, b) => b.fecha.localeCompare(a.fecha))
    .map((evento) => ({
      id: evento.id,
      tipo: evento.tipo,
      fecha: evento.fecha,
      ...tituloYDetalle(evento),
      estadoTono: tonoEvento(evento),
    }));
}

export function calcularResumenHembra(
  gestaciones: GestacionRow[],
  eventos: EventoReproductivoRow[],
  numeroCrias: number,
): ReproductiveSummaryHembra {
  const ultimoCelo = [...eventos]
    .filter((e) => e.tipo === "celo")
    .sort((a, b) => b.fecha.localeCompare(a.fecha))[0];
  const ultimaMontaOInseminacion = [...eventos]
    .filter((e) => e.tipo === "monta" || e.tipo === "inseminacion")
    .sort((a, b) => b.fecha.localeCompare(a.fecha))[0];
  const gestacionActual = [...gestaciones]
    .filter((g) => GESTACIONES_ACTIVAS.includes(g.estado))
    .sort((a, b) => b.fecha_inicio.localeCompare(a.fecha_inicio))[0];
  const numeroPartos = eventos.filter((e) => e.tipo === "parto").length;

  return {
    estado: calcularEstadoReproductivoHembra(gestaciones, eventos),
    ultimoCelo: ultimoCelo?.fecha ?? null,
    ultimaMontaOInseminacion: ultimaMontaOInseminacion?.fecha ?? null,
    gestacionActual: gestacionActual ? { ...gestacionActual, macho: null } : null,
    numeroPartos,
    numeroCrias,
  };
}

/** Construye el listado reproductivo general (un renglón por animal) para la página /reproduccion. */
export function construirListadoReproductivo(
  animales: (AnimalRef & { sexo: SexoAnimal })[],
  gestaciones: GestacionRow[],
  eventos: EventoReproductivoRow[],
): AnimalReproductivo[] {
  return animales.map((animal) => {
    if (animal.sexo === "hembra") {
      const gestacionesAnimal = gestaciones.filter((g) => g.animal_id === animal.id);
      const eventosAnimal = eventos.filter((e) => e.animal_id === animal.id);
      const gestacionActual =
        [...gestacionesAnimal]
          .filter((g) => g.estado === "en_seguimiento" || g.estado === "confirmada")
          .sort((a, b) => b.fecha_inicio.localeCompare(a.fecha_inicio))[0] ?? null;
      const ultimoEvento = [...eventosAnimal].sort((a, b) => b.fecha.localeCompare(a.fecha))[0] ?? null;

      return {
        animal,
        estado: calcularEstadoReproductivoHembra(gestacionesAnimal, eventosAnimal),
        gestacionActual: gestacionActual ? { ...gestacionActual, macho: null } : null,
        ultimoEvento,
      };
    }

    const montasComoMacho = eventos.filter((e) => e.macho_id === animal.id && e.tipo === "monta");
    const ultimoEvento = [...montasComoMacho].sort((a, b) => b.fecha.localeCompare(a.fecha))[0] ?? null;

    return {
      animal,
      estado: calcularEstadoReproductivoMacho(montasComoMacho),
      gestacionActual: null,
      ultimoEvento,
    };
  });
}

export interface DatosGeneralesReproduccion {
  listado: AnimalReproductivo[];
  stats: ReproduccionGeneralStats;
  proximosPartos: ProximoParto[];
  eventosRecientes: EventoRecienteFinca[];
  gestacionesActivas: GestacionActivaFinca[];
}

/** Deriva todo lo que necesita la página general /reproduccion a partir de los datos crudos de la finca. */
export function construirDatosGenerales(
  animales: (AnimalRef & { sexo: SexoAnimal })[],
  gestaciones: GestacionRow[],
  eventos: EventoReproductivoRow[],
): DatosGeneralesReproduccion {
  const animalPorId = new Map(animales.map((a) => [a.id, a]));
  const listado = construirListadoReproductivo(animales, gestaciones, eventos);

  const hembrasGestantes = listado.filter(
    (f) => f.animal.sexo === "hembra" && (f.estado === "gestante" || f.estado === "proxima_a_parto"),
  ).length;
  const hembrasEnCelo = listado.filter((f) => f.estado === "en_celo").length;

  const stats: ReproduccionGeneralStats = {
    hembras: animales.filter((a) => a.sexo === "hembra").length,
    hembrasGestantes,
    hembrasEnCelo,
    partosProximos: gestaciones.filter((g) => calcularAlertaParto(g) !== null).length,
    partosRegistrados: eventos.filter((e) => e.tipo === "parto").length,
    criasNacidas: eventos
      .filter((e) => e.tipo === "parto")
      .reduce((sum, e) => sum + (e.numero_crias ?? 0), 0),
  };

  const proximosPartos: ProximoParto[] = gestaciones
    .filter((g) => g.estado === "confirmada" && g.fecha_estimada_parto && calcularAlertaParto(g) !== null)
    .flatMap((g) => {
      const animal = animalPorId.get(g.animal_id);
      if (!animal || !g.fecha_estimada_parto) return [];
      return [
        {
          animal,
          fechaEstimadaParto: g.fecha_estimada_parto,
          diasRestantes: diasRestantesParto(g.fecha_estimada_parto),
        },
      ];
    })
    .sort((a, b) => a.diasRestantes - b.diasRestantes);

  const eventosRecientes: EventoRecienteFinca[] = [...eventos]
    .sort((a, b) => b.fecha.localeCompare(a.fecha))
    .slice(0, 10)
    .flatMap((e) => {
      const animal = animalPorId.get(e.animal_id);
      if (!animal) return [];
      return [{ animal, tipo: e.tipo, titulo: TIPO_EVENTO_REPRODUCTIVO_LABEL[e.tipo], fecha: e.fecha }];
    });

  const gestacionesActivas: GestacionActivaFinca[] = gestaciones
    .filter((g) => g.estado === "en_seguimiento" || g.estado === "confirmada")
    .flatMap((g) => {
      const animal = animalPorId.get(g.animal_id);
      if (!animal) return [];
      return [{ ...g, macho: null, animal }];
    })
    .sort((a, b) => b.fecha_inicio.localeCompare(a.fecha_inicio));

  return { listado, stats, proximosPartos, eventosRecientes, gestacionesActivas };
}

export function calcularResumenMacho(
  eventos: EventoReproductivoRow[],
  numeroCrias: number,
): ReproductiveSummaryMacho {
  const montas = eventos.filter((e) => e.tipo === "monta");
  const ultima = [...montas].sort((a, b) => b.fecha.localeCompare(a.fecha))[0];

  return {
    estado: calcularEstadoReproductivoMacho(montas),
    numeroMontas: montas.length,
    numeroCrias,
    ultimaMonta: ultima?.fecha ?? null,
  };
}
