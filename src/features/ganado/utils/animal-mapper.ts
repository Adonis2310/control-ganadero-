import type { Database } from "@/types/database.types";
import type { AnimalFormValues } from "@/features/ganado/validations/animal.schema";

type AnimalInsert = Database["public"]["Tables"]["animales"]["Insert"];
type AnimalUpdate = Database["public"]["Tables"]["animales"]["Update"];

function parsePeso(value: string): number | null {
  if (!value.trim()) return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
}

export function buildAnimalInsertPayload(
  values: AnimalFormValues,
  fincaId: string,
  fotoUrl: string | null,
): AnimalInsert {
  const peso = parsePeso(values.peso_kg ?? "");

  return {
    finca_id: fincaId,
    identificador: values.identificador.trim(),
    nombre: values.nombre?.trim() || null,
    sexo: values.sexo as AnimalInsert["sexo"],
    raza_id: values.raza_id || null,
    fecha_nacimiento: values.fecha_nacimiento || null,
    color: values.color?.trim() || null,
    peso_inicial_kg: peso,
    peso_actual_kg: peso,
    estado: values.estado as AnimalInsert["estado"],
    padre_id: values.padre_id || null,
    madre_id: values.madre_id || null,
    observaciones: values.observaciones?.trim() || null,
    foto_url: fotoUrl,
  };
}

export function buildAnimalUpdatePayload(
  values: AnimalFormValues,
  fotoUrl: string | null,
): AnimalUpdate {
  // peso_actual_kg NO se incluye aquí a propósito: desde la Fase 3 se
  // sincroniza automáticamente (vía trigger) con el último registro de la
  // tabla `pesos`. Editarlo ahora se hace desde la pestaña "Peso" de la
  // ficha del animal, no desde este formulario.
  return {
    identificador: values.identificador.trim(),
    nombre: values.nombre?.trim() || null,
    sexo: values.sexo as AnimalUpdate["sexo"],
    raza_id: values.raza_id || null,
    fecha_nacimiento: values.fecha_nacimiento || null,
    color: values.color?.trim() || null,
    estado: values.estado as AnimalUpdate["estado"],
    padre_id: values.padre_id || null,
    madre_id: values.madre_id || null,
    observaciones: values.observaciones?.trim() || null,
    foto_url: fotoUrl,
  };
}
