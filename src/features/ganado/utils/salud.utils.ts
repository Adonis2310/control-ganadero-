import type {
  AnimalHealthAlerts,
  AnimalHealthSummary,
  AnimalRef,
  DesparasitacionRow,
  EnfermedadRow,
  EstadoAplicacion,
  EstadoEnfermedad,
  EstadoTratamiento,
  RegistroSalud,
  TipoRegistroSalud,
  TratamientoRow,
  VacunaRow,
} from "@/features/ganado/types";

export const TIPO_REGISTRO_LABEL: Record<TipoRegistroSalud, string> = {
  vacuna: "Vacuna",
  desparasitacion: "Desparasitación",
  enfermedad: "Enfermedad",
  tratamiento: "Tratamiento",
};

/** Días de anticipación a partir de los cuales una próxima aplicación se considera "próxima" en vez de "aplicada". */
const UMBRAL_PROXIMA_DIAS = 15;

function hoyISO(): string {
  return new Date().toISOString().split("T")[0];
}

function diasHasta(fecha: string): number {
  const hoy = new Date(`${hoyISO()}T00:00:00`);
  const objetivo = new Date(`${fecha}T00:00:00`);
  return Math.round((objetivo.getTime() - hoy.getTime()) / 86_400_000);
}

/** Calcula si una vacuna/desparasitación está aplicada, próxima a vencer o vencida, según su próxima aplicación. */
export function calcularEstadoAplicacion(proximaAplicacion: string | null): EstadoAplicacion {
  if (!proximaAplicacion) return "aplicada";
  const dias = diasHasta(proximaAplicacion);
  if (dias < 0) return "vencida";
  if (dias <= UMBRAL_PROXIMA_DIAS) return "proxima";
  return "aplicada";
}

/** Calcula si un tratamiento sigue activo o ya finalizó, según su fecha de fin. */
export function calcularEstadoTratamiento(fechaFin: string | null): EstadoTratamiento {
  if (!fechaFin) return "activo";
  return fechaFin < hoyISO() ? "finalizado" : "activo";
}

export const ESTADO_APLICACION_LABEL: Record<EstadoAplicacion, string> = {
  aplicada: "Aplicada",
  proxima: "Próxima",
  vencida: "Vencida",
};

export const ESTADO_APLICACION_BADGE_CLASS: Record<EstadoAplicacion, string> = {
  aplicada: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300",
  proxima: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
  vencida: "bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300",
};

export const ESTADO_ENFERMEDAD_LABEL: Record<EstadoEnfermedad, string> = {
  activa: "Activa",
  recuperado: "Recuperado",
};

export const ESTADO_ENFERMEDAD_BADGE_CLASS: Record<EstadoEnfermedad, string> = {
  activa: "bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300",
  recuperado: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300",
};

export const ESTADO_TRATAMIENTO_LABEL: Record<EstadoTratamiento, string> = {
  activo: "Activo",
  finalizado: "Finalizado",
};

export const ESTADO_TRATAMIENTO_BADGE_CLASS: Record<EstadoTratamiento, string> = {
  activo: "bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300",
  finalizado: "bg-muted text-muted-foreground",
};

export function calcularResumenSalud(
  vacunas: VacunaRow[],
  desparasitaciones: DesparasitacionRow[],
  enfermedades: EnfermedadRow[],
  tratamientos: TratamientoRow[],
): AnimalHealthSummary {
  return {
    vacunasAplicadas: vacunas.length,
    vacunasProximas: vacunas.filter(
      (v) => calcularEstadoAplicacion(v.proxima_aplicacion) === "proxima",
    ).length,
    desparasitaciones: desparasitaciones.length,
    enfermedadesActivas: enfermedades.filter((e) => e.estado === "activa").length,
    tratamientosActivos: tratamientos.filter(
      (t) => calcularEstadoTratamiento(t.fecha_fin) === "activo",
    ).length,
  };
}

export function calcularAlertasAnimal(
  vacunas: VacunaRow[],
  desparasitaciones: DesparasitacionRow[],
  enfermedades: EnfermedadRow[],
): AnimalHealthAlerts {
  const estadosVacunas = vacunas.map((v) => calcularEstadoAplicacion(v.proxima_aplicacion));
  const estadosDesparasitaciones = desparasitaciones.map((d) =>
    calcularEstadoAplicacion(d.proxima_aplicacion),
  );

  return {
    vacunaProxima: estadosVacunas.includes("proxima"),
    vacunaVencida: estadosVacunas.includes("vencida"),
    desparasitacionProxima: estadosDesparasitaciones.includes("proxima"),
    desparasitacionVencida: estadosDesparasitaciones.includes("vencida"),
    enfermedadActiva: enfermedades.some((e) => e.estado === "activa"),
  };
}

/** Construye la línea de tiempo sanitaria de un animal, ordenada de más reciente a más antigua. */
export function construirTimelineAnimal(
  vacunas: VacunaRow[],
  desparasitaciones: DesparasitacionRow[],
  enfermedades: EnfermedadRow[],
  tratamientos: TratamientoRow[],
): RegistroSalud[] {
  const registros: RegistroSalud[] = [
    ...vacunas.map((v) => ({
      id: v.id,
      tipo: "vacuna" as const,
      animalId: v.animal_id,
      animal: null,
      titulo: v.nombre,
      fecha: v.fecha_aplicacion,
      estadoLabel: ESTADO_APLICACION_LABEL[calcularEstadoAplicacion(v.proxima_aplicacion)],
      estadoTono: tonoAplicacion(calcularEstadoAplicacion(v.proxima_aplicacion)),
      detalle: v.observaciones,
    })),
    ...desparasitaciones.map((d) => ({
      id: d.id,
      tipo: "desparasitacion" as const,
      animalId: d.animal_id,
      animal: null,
      titulo: d.producto,
      fecha: d.fecha_aplicacion,
      estadoLabel: ESTADO_APLICACION_LABEL[calcularEstadoAplicacion(d.proxima_aplicacion)],
      estadoTono: tonoAplicacion(calcularEstadoAplicacion(d.proxima_aplicacion)),
      detalle: d.observaciones,
    })),
    ...enfermedades.map((e) => ({
      id: e.id,
      tipo: "enfermedad" as const,
      animalId: e.animal_id,
      animal: null,
      titulo: e.enfermedad,
      fecha: e.fecha_diagnostico,
      estadoLabel: ESTADO_ENFERMEDAD_LABEL[e.estado],
      estadoTono: e.estado === "activa" ? ("negativo" as const) : ("positivo" as const),
      detalle: e.descripcion,
    })),
    ...tratamientos.map((t) => ({
      id: t.id,
      tipo: "tratamiento" as const,
      animalId: t.animal_id,
      animal: null,
      titulo: t.tratamiento,
      fecha: t.fecha_inicio,
      estadoLabel: ESTADO_TRATAMIENTO_LABEL[calcularEstadoTratamiento(t.fecha_fin)],
      estadoTono:
        calcularEstadoTratamiento(t.fecha_fin) === "activo"
          ? ("neutral" as const)
          : ("positivo" as const),
      detalle: t.observaciones,
    })),
  ];

  return registros.sort((a, b) => b.fecha.localeCompare(a.fecha));
}

/** Rellena el campo `animal` de cada registro a partir de un mapa animalId -> AnimalRef (página general de Salud). */
export function adjuntarAnimales(
  registros: RegistroSalud[],
  animalPorId: Map<string, AnimalRef>,
): RegistroSalud[] {
  return registros.map((registro) => ({
    ...registro,
    animal: animalPorId.get(registro.animalId) ?? null,
  }));
}

function tonoAplicacion(estado: EstadoAplicacion): RegistroSalud["estadoTono"] {
  if (estado === "vencida") return "negativo";
  if (estado === "proxima") return "atencion";
  return "positivo";
}
