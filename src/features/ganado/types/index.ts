import type { Database } from "@/types/database.types";

export type SexoAnimal = Database["public"]["Tables"]["animales"]["Row"]["sexo"];
export type EstadoAnimal = Database["public"]["Tables"]["animales"]["Row"]["estado"];
export type AnimalRow = Database["public"]["Tables"]["animales"]["Row"];
export type Raza = Database["public"]["Tables"]["razas"]["Row"];

export const SEXO_OPTIONS: { value: SexoAnimal; label: string }[] = [
  { value: "macho", label: "Macho" },
  { value: "hembra", label: "Hembra" },
];

export const ESTADO_OPTIONS: { value: EstadoAnimal; label: string }[] = [
  { value: "activo", label: "Activo" },
  { value: "vendido", label: "Vendido" },
  { value: "fallecido", label: "Fallecido" },
  { value: "transferido", label: "Transferido" },
];

/** Referencia mínima a un animal, usada para mostrar padre/madre. */
export interface AnimalRef {
  id: string;
  identificador: string;
  nombre: string | null;
}

/** Animal con sus relaciones resueltas, tal como se muestra en la UI. */
export interface Animal extends AnimalRow {
  raza: Pick<Raza, "id" | "nombre"> | null;
  padre: AnimalRef | null;
  madre: AnimalRef | null;
}

export interface AnimalStats {
  total: number;
  hembras: number;
  machos: number;
  activos: number;
}

export interface AnimalFilters {
  search: string;
  sexo: SexoAnimal | "todos";
  razaId: string | "todos";
  estado: EstadoAnimal | "todos";
}

export const DEFAULT_ANIMAL_FILTERS: AnimalFilters = {
  search: "",
  sexo: "todos",
  razaId: "todos",
  estado: "todos",
};

// ----------------------------------------------------------------------------
// Control de peso
// ----------------------------------------------------------------------------

export type PesoRow = Database["public"]["Tables"]["pesos"]["Row"];

/** Referencia mínima al animal dueño de un pesaje, para la página general. */
export interface PesoAnimalRef {
  id: string;
  identificador: string;
  nombre: string | null;
}

/** Pesaje con el animal resuelto (usado en la página general de pesos). */
export interface PesoConAnimal extends PesoRow {
  animal: PesoAnimalRef | null;
}

/** Pesaje con la variación respecto al pesaje cronológicamente anterior. */
export interface PesoConVariacion extends PesoRow {
  variacionKg: number | null;
  variacionPorcentaje: number | null;
}

export interface PesoStats {
  pesoActual: number | null;
  pesoInicial: number | null;
  pesoMaximo: number | null;
  pesoMinimo: number | null;
  gananciaTotalKg: number | null;
  gananciaPromedioKg: number | null;
  cantidadPesajes: number;
}

export interface PesoFilters {
  search: string;
  desde: string;
  hasta: string;
  pesoMin: string;
  pesoMax: string;
}

export const DEFAULT_PESO_FILTERS: PesoFilters = {
  search: "",
  desde: "",
  hasta: "",
  pesoMin: "",
  pesoMax: "",
};

export interface PesoGeneralStats {
  totalPesajes: number;
  pesoPromedioHato: number | null;
  animalMayorPeso: (PesoAnimalRef & { peso: number }) | null;
  animalMenorPeso: (PesoAnimalRef & { peso: number }) | null;
}

// ----------------------------------------------------------------------------
// Salud animal
// ----------------------------------------------------------------------------

export type VacunaRow = Database["public"]["Tables"]["vacunas"]["Row"];
export type DesparasitacionRow = Database["public"]["Tables"]["desparasitaciones"]["Row"];
export type EnfermedadRow = Database["public"]["Tables"]["enfermedades"]["Row"];
export type TratamientoRow = Database["public"]["Tables"]["tratamientos"]["Row"];
export type EstadoEnfermedad = EnfermedadRow["estado"];

/** Estado calculado (no almacenado) de una vacuna o desparasitación, según sus fechas. */
export type EstadoAplicacion = "aplicada" | "proxima" | "vencida";

/** Estado calculado (no almacenado) de un tratamiento, según su fecha de fin. */
export type EstadoTratamiento = "activo" | "finalizado";

export const ESTADO_ENFERMEDAD_OPTIONS: { value: EstadoEnfermedad; label: string }[] = [
  { value: "activa", label: "Activa" },
  { value: "recuperado", label: "Recuperado" },
];

/** Tratamiento con la enfermedad relacionada resuelta (si tiene). */
export interface TratamientoConEnfermedad extends TratamientoRow {
  enfermedad: Pick<EnfermedadRow, "id" | "enfermedad"> | null;
}

/** Resumen sanitario de un animal, mostrado como tarjetas en la pestaña Salud. */
export interface AnimalHealthSummary {
  vacunasAplicadas: number;
  vacunasProximas: number;
  desparasitaciones: number;
  enfermedadesActivas: number;
  tratamientosActivos: number;
}

/** Alertas sanitarias activas de un animal (vacunas/desparasitaciones próximas o vencidas, enfermedad activa). */
export interface AnimalHealthAlerts {
  vacunaProxima: boolean;
  vacunaVencida: boolean;
  desparasitacionProxima: boolean;
  desparasitacionVencida: boolean;
  enfermedadActiva: boolean;
}

/** Alertas sanitarias agregadas de toda la finca, para el dashboard general. */
export interface HealthDashboardAlerts {
  vacunasProximas: number;
  vacunasVencidas: number;
  desparasitacionesProximas: number;
  desparasitacionesVencidas: number;
  animalesConEnfermedadActiva: number;
}

export type TipoRegistroSalud = "vacuna" | "desparasitacion" | "enfermedad" | "tratamiento";

/** Un evento sanitario normalizado, usado por el timeline y la página general de Salud. */
export interface RegistroSalud {
  id: string;
  tipo: TipoRegistroSalud;
  animalId: string;
  animal: AnimalRef | null;
  titulo: string;
  fecha: string;
  estadoLabel: string;
  estadoTono: "neutral" | "positivo" | "atencion" | "negativo";
  detalle: string | null;
}

export interface SaludFilters {
  search: string;
  animalId: string | "todos";
  tipo: TipoRegistroSalud | "todos";
  desde: string;
  hasta: string;
}

export const DEFAULT_SALUD_FILTERS: SaludFilters = {
  search: "",
  animalId: "todos",
  tipo: "todos",
  desde: "",
  hasta: "",
};

// ----------------------------------------------------------------------------
// Reproducción
// ----------------------------------------------------------------------------

export type EventoReproductivoRow = Database["public"]["Tables"]["eventos_reproductivos"]["Row"];
export type GestacionRow = Database["public"]["Tables"]["gestaciones"]["Row"];

export type TipoEventoReproductivo = EventoReproductivoRow["tipo"];
export type EstadoGestacion = GestacionRow["estado"];
export type MetodoConcepcion = NonNullable<GestacionRow["metodo_concepcion"]>;
export type ResultadoDiagnostico = NonNullable<EventoReproductivoRow["resultado_diagnostico"]>;
export type TipoMonta = NonNullable<EventoReproductivoRow["tipo_monta"]>;
export type EstadoPartoEvento = NonNullable<EventoReproductivoRow["estado_parto"]>;

/** Estado calculado (no almacenado) del ciclo reproductivo de una hembra. */
export type EstadoReproductivoHembra =
  | "disponible"
  | "en_celo"
  | "servida"
  | "gestante"
  | "proxima_a_parto"
  | "recuperandose"
  | "sin_informacion";

/** Estado calculado (no almacenado) del ciclo reproductivo de un macho. */
export type EstadoReproductivoMacho = "activo" | "disponible" | "sin_informacion";

export const TIPO_EVENTO_REPRODUCTIVO_LABEL: Record<TipoEventoReproductivo, string> = {
  celo: "Celo",
  monta: "Monta",
  inseminacion: "Inseminación",
  diagnostico: "Diagnóstico de preñez",
  parto: "Parto",
  aborto: "Aborto",
};

export const ESTADO_GESTACION_OPTIONS: { value: EstadoGestacion; label: string }[] = [
  { value: "en_seguimiento", label: "En seguimiento" },
  { value: "confirmada", label: "Confirmada" },
  { value: "finalizada", label: "Finalizada" },
  { value: "abortada", label: "Abortada" },
];

/** Gestación con el macho (padre) resuelto, cuando se conoce. */
export interface GestacionConMacho extends GestacionRow {
  macho: AnimalRef | null;
}

/** Evento reproductivo con el macho involucrado resuelto, cuando se conoce. */
export interface EventoReproductivoConMacho extends EventoReproductivoRow {
  macho: AnimalRef | null;
}

/** Referencia a una cría (animal cuya madre o padre es el animal consultado). */
export interface CriaRef extends AnimalRef {
  sexo: SexoAnimal;
  fecha_nacimiento: string | null;
}

export interface ReproductiveSummaryHembra {
  estado: EstadoReproductivoHembra;
  ultimoCelo: string | null;
  ultimaMontaOInseminacion: string | null;
  gestacionActual: GestacionConMacho | null;
  numeroPartos: number;
  numeroCrias: number;
}

export interface ReproductiveSummaryMacho {
  estado: EstadoReproductivoMacho;
  numeroMontas: number;
  numeroCrias: number;
  ultimaMonta: string | null;
}

/** Un evento normalizado para la línea de tiempo reproductiva de un animal. */
export interface RegistroReproductivo {
  id: string;
  tipo: TipoEventoReproductivo;
  fecha: string;
  titulo: string;
  detalle: string | null;
  estadoTono: "neutral" | "positivo" | "atencion" | "negativo";
}

export interface ReproduccionFilters {
  search: string;
  animalId: string | "todos";
  sexo: SexoAnimal | "todos";
  estadoReproductivo: EstadoReproductivoHembra | EstadoReproductivoMacho | "todos";
  estadoGestacion: EstadoGestacion | "todos";
  desde: string;
  hasta: string;
}

export const DEFAULT_REPRODUCCION_FILTERS: ReproduccionFilters = {
  search: "",
  animalId: "todos",
  sexo: "todos",
  estadoReproductivo: "todos",
  estadoGestacion: "todos",
  desde: "",
  hasta: "",
};

export interface ReproduccionGeneralStats {
  hembras: number;
  hembrasGestantes: number;
  hembrasEnCelo: number;
  partosProximos: number;
  partosRegistrados: number;
  criasNacidas: number;
}

export interface ProximoParto {
  animal: AnimalRef;
  fechaEstimadaParto: string;
  diasRestantes: number;
}

export interface EventoRecienteFinca {
  animal: AnimalRef;
  tipo: TipoEventoReproductivo;
  titulo: string;
  fecha: string;
}

export interface GestacionActivaFinca extends GestacionConMacho {
  animal: AnimalRef;
}

/** Fila del listado reproductivo general (un animal con su estado calculado). */
export interface AnimalReproductivo {
  animal: AnimalRef & { sexo: SexoAnimal };
  estado: EstadoReproductivoHembra | EstadoReproductivoMacho;
  gestacionActual: GestacionConMacho | null;
  ultimoEvento: EventoReproductivoRow | null;
}
