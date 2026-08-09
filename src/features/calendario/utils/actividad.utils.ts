import type { DesparasitacionRow, GestacionRow, VacunaRow } from "@/features/ganado/types";
import {
  TIPO_ACTIVIDAD_OPTIONS,
  type ActividadAnimalRef,
  type ActividadConAnimal,
  type ActividadRow,
  type ActividadStats,
  type CalendarEvent,
  type EstadoActividad,
  type PrioridadActividad,
  type TipoActividad,
} from "@/features/calendario/types";

export const TIPO_ACTIVIDAD_LABEL: Record<TipoActividad, string> = Object.fromEntries(
  TIPO_ACTIVIDAD_OPTIONS.map((option) => [option.value, option.label]),
) as Record<TipoActividad, string>;

export const ESTADO_ACTIVIDAD_LABEL: Record<EstadoActividad, string> = {
  pendiente: "Pendiente",
  en_progreso: "En progreso",
  completada: "Completada",
  cancelada: "Cancelada",
};

export const ESTADO_ACTIVIDAD_BADGE_CLASS: Record<EstadoActividad, string> = {
  pendiente: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
  en_progreso: "bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300",
  completada: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300",
  cancelada: "bg-muted text-muted-foreground",
};

export const PRIORIDAD_ACTIVIDAD_LABEL: Record<PrioridadActividad, string> = {
  baja: "Baja",
  media: "Media",
  alta: "Alta",
};

export const PRIORIDAD_ACTIVIDAD_BADGE_CLASS: Record<PrioridadActividad, string> = {
  baja: "bg-muted text-muted-foreground",
  media: "bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300",
  alta: "bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300",
};

export const PRIORIDAD_DOT_CLASS: Record<PrioridadActividad, string> = {
  baja: "bg-muted-foreground/50",
  media: "bg-sky-500",
  alta: "bg-red-500",
};

export function hoyISO(): string {
  return new Date().toISOString().split("T")[0];
}

export function formatearFechaActividad(fecha: string): string {
  return new Date(`${fecha}T00:00:00`).toLocaleDateString("es", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatearHora(hora: string | null): string | null {
  if (!hora) return null;
  return hora.slice(0, 5);
}

/** Una actividad vencida es una pendiente/en progreso cuya fecha ya pasó (no se guarda como estado en BD). */
export function esVencida(actividad: Pick<ActividadRow, "fecha" | "estado">): boolean {
  return actividad.fecha < hoyISO() && actividad.estado !== "completada" && actividad.estado !== "cancelada";
}

export function esHoy(fecha: string): boolean {
  return fecha === hoyISO();
}

/** True si la fecha cae en los próximos `dias` días, sin incluir hoy ni el pasado. */
export function estaEnProximosDias(fecha: string, dias: number): boolean {
  const hoy = hoyISO();
  if (fecha <= hoy) return false;
  const limite = new Date(`${hoy}T00:00:00`);
  limite.setDate(limite.getDate() + dias);
  return fecha <= limite.toISOString().split("T")[0];
}

export function calcularActividadStats(actividades: ActividadRow[]): ActividadStats {
  return {
    hoy: actividades.filter((a) => esHoy(a.fecha) && a.estado !== "cancelada").length,
    pendientes: actividades.filter((a) => a.estado === "pendiente" || a.estado === "en_progreso").length,
    vencidas: actividades.filter(esVencida).length,
    completadas: actividades.filter((a) => a.estado === "completada").length,
    altaPrioridad: actividades.filter(
      (a) => a.prioridad === "alta" && a.estado !== "completada" && a.estado !== "cancelada",
    ).length,
  };
}

export function ordenarPorFechaHora<T extends { fecha: string; horaInicio: string | null }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    if (a.fecha !== b.fecha) return a.fecha.localeCompare(b.fecha);
    return (a.horaInicio ?? "").localeCompare(b.horaInicio ?? "");
  });
}

// ----------------------------------------------------------------------------
// Eventos del calendario: combina actividades reales con eventos derivados
// (de solo lectura) de Salud y Reproducción, sin duplicar registros.
// ----------------------------------------------------------------------------

export function construirEventosDesdeActividades(actividades: ActividadConAnimal[]): CalendarEvent[] {
  return actividades.map((actividad) => ({
    id: `actividad-${actividad.id}`,
    origen: "actividad",
    actividadId: actividad.id,
    titulo: actividad.titulo,
    tipo: actividad.tipo,
    fecha: actividad.fecha,
    horaInicio: actividad.hora_inicio,
    horaFin: actividad.hora_fin,
    estado: actividad.estado,
    prioridad: actividad.prioridad,
    animal: actividad.animal,
    descripcion: actividad.descripcion,
    readonly: false,
    href: `/calendario/${actividad.id}`,
  }));
}

export function construirEventosSalud(
  vacunas: Pick<VacunaRow, "id" | "animal_id" | "nombre" | "proxima_aplicacion">[],
  desparasitaciones: Pick<DesparasitacionRow, "id" | "animal_id" | "producto" | "proxima_aplicacion">[],
  animalPorId: Map<string, ActividadAnimalRef>,
): CalendarEvent[] {
  const eventos: CalendarEvent[] = [];

  for (const vacuna of vacunas) {
    if (!vacuna.proxima_aplicacion) continue;
    eventos.push({
      id: `salud-vacuna-${vacuna.id}`,
      origen: "salud",
      actividadId: null,
      titulo: `Vacunación — ${vacuna.nombre}`,
      tipo: "vacunacion",
      fecha: vacuna.proxima_aplicacion,
      horaInicio: null,
      horaFin: null,
      estado: "pendiente",
      prioridad: "media",
      animal: animalPorId.get(vacuna.animal_id) ?? null,
      descripcion: "Próxima aplicación registrada en Salud animal.",
      readonly: true,
      href: `/ganado/${vacuna.animal_id}`,
    });
  }

  for (const desparasitacion of desparasitaciones) {
    if (!desparasitacion.proxima_aplicacion) continue;
    eventos.push({
      id: `salud-desparasitacion-${desparasitacion.id}`,
      origen: "salud",
      actividadId: null,
      titulo: `Desparasitación — ${desparasitacion.producto}`,
      tipo: "desparasitacion",
      fecha: desparasitacion.proxima_aplicacion,
      horaInicio: null,
      horaFin: null,
      estado: "pendiente",
      prioridad: "media",
      animal: animalPorId.get(desparasitacion.animal_id) ?? null,
      descripcion: "Próxima aplicación registrada en Salud animal.",
      readonly: true,
      href: `/ganado/${desparasitacion.animal_id}`,
    });
  }

  return eventos;
}

const ESTADOS_GESTACION_ACTIVA = ["en_seguimiento", "confirmada"] as const;

export function construirEventosReproduccion(
  gestaciones: Pick<GestacionRow, "id" | "animal_id" | "fecha_estimada_parto" | "estado">[],
  animalPorId: Map<string, ActividadAnimalRef>,
): CalendarEvent[] {
  return gestaciones
    .filter(
      (gestacion): gestacion is typeof gestacion & { fecha_estimada_parto: string } =>
        Boolean(gestacion.fecha_estimada_parto) &&
        (ESTADOS_GESTACION_ACTIVA as readonly string[]).includes(gestacion.estado),
    )
    .map((gestacion) => ({
      id: `reproduccion-parto-${gestacion.id}`,
      origen: "reproduccion" as const,
      actividadId: null,
      titulo: "Parto esperado",
      tipo: "parto" as const,
      fecha: gestacion.fecha_estimada_parto,
      horaInicio: null,
      horaFin: null,
      estado: "pendiente" as const,
      prioridad: "alta" as const,
      animal: animalPorId.get(gestacion.animal_id) ?? null,
      descripcion: "Fecha estimada de parto registrada en Reproducción.",
      readonly: true,
      href: `/ganado/${gestacion.animal_id}`,
    }));
}

export function combinarEventos(...listas: CalendarEvent[][]): CalendarEvent[] {
  return ordenarPorFechaHora(listas.flat());
}

/** Un evento (real o derivado) se considera vencido si su fecha ya pasó y no está completado/cancelado. */
export function esEventoVencido(evento: CalendarEvent): boolean {
  return evento.fecha < hoyISO() && evento.estado !== "completada" && evento.estado !== "cancelada";
}

export function agruparEventosPorFecha(eventos: CalendarEvent[]): Map<string, CalendarEvent[]> {
  const mapa = new Map<string, CalendarEvent[]>();
  for (const evento of eventos) {
    const lista = mapa.get(evento.fecha) ?? [];
    lista.push(evento);
    mapa.set(evento.fecha, lista);
  }
  return mapa;
}

// ----------------------------------------------------------------------------
// Grilla del calendario mensual/semanal
// ----------------------------------------------------------------------------

export interface CalendarDayCell {
  fecha: string;
  enMes: boolean;
}

function toISODate(date: Date): string {
  return date.toISOString().split("T")[0];
}

/** Lunes de la semana que contiene `date`. */
function inicioSemana(date: Date): Date {
  const copia = new Date(date);
  const diff = (copia.getDay() + 6) % 7; // lunes = 0
  copia.setDate(copia.getDate() - diff);
  return copia;
}

/** Grilla de 6 semanas (42 días) que cubre el mes indicado, empezando en lunes. */
export function construirGridMensual(anio: number, mes: number): CalendarDayCell[] {
  const primerDia = new Date(anio, mes, 1);
  const inicioGrid = inicioSemana(primerDia);

  const celdas: CalendarDayCell[] = [];
  for (let i = 0; i < 42; i++) {
    const dia = new Date(inicioGrid);
    dia.setDate(inicioGrid.getDate() + i);
    celdas.push({ fecha: toISODate(dia), enMes: dia.getMonth() === mes });
  }
  return celdas;
}

/** Los 7 días (lunes a domingo) de la semana que contiene `fecha`. */
export function construirDiasSemana(fecha: string): string[] {
  const inicio = inicioSemana(new Date(`${fecha}T00:00:00`));
  return Array.from({ length: 7 }, (_, i) => {
    const dia = new Date(inicio);
    dia.setDate(inicio.getDate() + i);
    return toISODate(dia);
  });
}

export function sumarDias(fecha: string, dias: number): string {
  const base = new Date(`${fecha}T00:00:00`);
  base.setDate(base.getDate() + dias);
  return toISODate(base);
}

export function sumarMeses(fecha: string, meses: number): string {
  const base = new Date(`${fecha}T00:00:00`);
  base.setMonth(base.getMonth() + meses);
  return toISODate(base);
}

const NOMBRE_DIA_CORTO = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

export function nombreDiaCorto(fecha: string): string {
  const indice = (new Date(`${fecha}T00:00:00`).getDay() + 6) % 7;
  return NOMBRE_DIA_CORTO[indice];
}

export function formatearEtiquetaMes(fecha: string): string {
  const etiqueta = new Date(`${fecha}T00:00:00`).toLocaleDateString("es", { month: "long", year: "numeric" });
  return etiqueta.charAt(0).toUpperCase() + etiqueta.slice(1);
}

export function formatearEtiquetaDia(fecha: string): string {
  const etiqueta = new Date(`${fecha}T00:00:00`).toLocaleDateString("es", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return etiqueta.charAt(0).toUpperCase() + etiqueta.slice(1);
}

export function formatearEtiquetaSemana(dias: string[]): string {
  if (dias.length === 0) return "";
  return `${formatearFechaActividad(dias[0])} – ${formatearFechaActividad(dias[dias.length - 1])}`;
}
