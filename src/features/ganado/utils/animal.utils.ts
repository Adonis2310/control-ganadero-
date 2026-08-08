import type { EstadoAnimal, SexoAnimal } from "@/features/ganado/types";

/** Calcula una edad legible ("2 años 3 meses", "8 meses", "5 días") a partir de una fecha ISO. */
export function calcularEdad(fechaNacimiento: string | null): string {
  if (!fechaNacimiento) return "Sin registrar";

  const nacimiento = new Date(fechaNacimiento);
  const ahora = new Date();

  let años = ahora.getFullYear() - nacimiento.getFullYear();
  let meses = ahora.getMonth() - nacimiento.getMonth();
  let días = ahora.getDate() - nacimiento.getDate();

  if (días < 0) {
    meses -= 1;
    días += new Date(ahora.getFullYear(), ahora.getMonth(), 0).getDate();
  }
  if (meses < 0) {
    años -= 1;
    meses += 12;
  }

  if (años > 0) {
    return meses > 0 ? `${años} a. ${meses} m.` : `${años} ${años === 1 ? "año" : "años"}`;
  }
  if (meses > 0) {
    return `${meses} ${meses === 1 ? "mes" : "meses"}`;
  }
  return días <= 1 ? "Recién nacido" : `${días} días`;
}

export function formatearPeso(kg: number | null): string {
  if (kg === null || kg === undefined) return "Sin registrar";
  return `${kg.toLocaleString("es", { maximumFractionDigits: 1 })} kg`;
}

export function formatearFecha(fecha: string | null): string {
  if (!fecha) return "Sin registrar";
  return new Date(`${fecha}T00:00:00`).toLocaleDateString("es", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function obtenerIniciales(nombre: string | null, identificador: string): string {
  if (nombre && nombre.trim()) {
    const partes = nombre.trim().split(/\s+/);
    return partes
      .slice(0, 2)
      .map((parte) => parte[0]?.toUpperCase())
      .join("");
  }
  return identificador.slice(0, 2).toUpperCase();
}

export const SEXO_LABEL: Record<SexoAnimal, string> = {
  macho: "Macho",
  hembra: "Hembra",
};

export const ESTADO_LABEL: Record<EstadoAnimal, string> = {
  activo: "Activo",
  vendido: "Vendido",
  fallecido: "Fallecido",
  transferido: "Transferido",
};

export const ESTADO_BADGE_CLASS: Record<EstadoAnimal, string> = {
  activo: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300",
  vendido: "bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300",
  fallecido: "bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300",
  transferido: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
};
