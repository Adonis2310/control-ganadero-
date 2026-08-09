import type { Database } from "@/types/database.types";

export type ActividadRow = Database["public"]["Tables"]["actividades"]["Row"];
export type TipoActividad = ActividadRow["tipo"];
export type EstadoActividad = ActividadRow["estado"];
export type PrioridadActividad = ActividadRow["prioridad"];
export type RecurrenciaActividad = ActividadRow["recurrencia"];

export interface TipoActividadOption {
  value: TipoActividad;
  label: string;
}

/** Categorías centralizadas de actividades: única fuente de verdad para selects, filtros y badges. */
export const TIPO_ACTIVIDAD_OPTIONS: TipoActividadOption[] = [
  { value: "vacunacion", label: "Vacunación" },
  { value: "desparasitacion", label: "Desparasitación" },
  { value: "tratamiento", label: "Tratamiento" },
  { value: "consulta_veterinaria", label: "Consulta veterinaria" },
  { value: "pesaje", label: "Pesaje" },
  { value: "inseminacion", label: "Inseminación" },
  { value: "revision_reproductiva", label: "Revisión reproductiva" },
  { value: "diagnostico_prenez", label: "Diagnóstico de preñez" },
  { value: "parto", label: "Parto" },
  { value: "alimentacion", label: "Alimentación" },
  { value: "mantenimiento", label: "Mantenimiento" },
  { value: "compra", label: "Compra" },
  { value: "otro", label: "Otro" },
];

export const ESTADO_ACTIVIDAD_OPTIONS: { value: EstadoActividad; label: string }[] = [
  { value: "pendiente", label: "Pendiente" },
  { value: "en_progreso", label: "En progreso" },
  { value: "completada", label: "Completada" },
  { value: "cancelada", label: "Cancelada" },
];

export const PRIORIDAD_ACTIVIDAD_OPTIONS: { value: PrioridadActividad; label: string }[] = [
  { value: "baja", label: "Baja" },
  { value: "media", label: "Media" },
  { value: "alta", label: "Alta" },
];

export const RECURRENCIA_OPTIONS: { value: RecurrenciaActividad; label: string }[] = [
  { value: "ninguna", label: "Sin repetición" },
  { value: "diaria", label: "Diaria" },
  { value: "semanal", label: "Semanal" },
  { value: "mensual", label: "Mensual" },
];

/** Referencia de animal con los datos que debe mostrar una actividad asociada (arete, nombre, raza, sexo). */
export interface ActividadAnimalRef {
  id: string;
  identificador: string;
  nombre: string | null;
  sexo: "macho" | "hembra";
  raza: string | null;
}

export interface ActividadConAnimal extends ActividadRow {
  animal: ActividadAnimalRef | null;
}

export interface ActividadFilters {
  search: string;
  tipo: TipoActividad | "todos";
  estado: EstadoActividad | "todos";
  prioridad: PrioridadActividad | "todas";
  animalId: string | "todos";
  desde: string;
  hasta: string;
}

export const DEFAULT_ACTIVIDAD_FILTERS: ActividadFilters = {
  search: "",
  tipo: "todos",
  estado: "todos",
  prioridad: "todas",
  animalId: "todos",
  desde: "",
  hasta: "",
};

export type CalendarViewMode = "mes" | "semana" | "dia";

/** De dónde proviene un evento mostrado en el calendario. */
export type EventoOrigen = "actividad" | "salud" | "reproduccion";

/**
 * Modelo unificado para pintar el calendario: combina actividades reales
 * (editables) con eventos derivados de Salud/Reproducción (de solo lectura,
 * calculados a partir de sus propias fechas, sin duplicar datos).
 */
export interface CalendarEvent {
  id: string;
  origen: EventoOrigen;
  actividadId: string | null;
  titulo: string;
  tipo: TipoActividad;
  fecha: string;
  horaInicio: string | null;
  horaFin: string | null;
  estado: EstadoActividad;
  prioridad: PrioridadActividad;
  animal: ActividadAnimalRef | null;
  descripcion: string | null;
  readonly: boolean;
  href: string | null;
}

export interface ActividadStats {
  hoy: number;
  pendientes: number;
  vencidas: number;
  completadas: number;
  altaPrioridad: number;
}
