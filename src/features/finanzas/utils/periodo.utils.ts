import type { PeriodoFinanciero, RangoFechas } from "@/features/finanzas/types";

function localDate(y: number, m: number, d: number): Date {
  return new Date(y, m, d);
}

/** Convierte a "YYYY-MM-DD" usando los componentes locales (nunca via toISOString, que puede desfasar el día según la zona horaria). */
function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function hoy(): Date {
  const now = new Date();
  return localDate(now.getFullYear(), now.getMonth(), now.getDate());
}

/** Calcula el rango [desde, hasta] (inclusive) correspondiente al período seleccionado. */
export function calcularRangoPeriodo(periodo: PeriodoFinanciero, personalizado?: RangoFechas): RangoFechas {
  const today = hoy();

  switch (periodo) {
    case "hoy":
      return { desde: toISODate(today), hasta: toISODate(today) };

    case "semana": {
      const dayOfWeek = today.getDay(); // 0 = domingo
      const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      const inicio = new Date(today);
      inicio.setDate(inicio.getDate() - diffToMonday);
      return { desde: toISODate(inicio), hasta: toISODate(today) };
    }

    case "mes": {
      const inicio = localDate(today.getFullYear(), today.getMonth(), 1);
      return { desde: toISODate(inicio), hasta: toISODate(today) };
    }

    case "mes_anterior": {
      const inicio = localDate(today.getFullYear(), today.getMonth() - 1, 1);
      const fin = localDate(today.getFullYear(), today.getMonth(), 0);
      return { desde: toISODate(inicio), hasta: toISODate(fin) };
    }

    case "anio": {
      const inicio = localDate(today.getFullYear(), 0, 1);
      return { desde: toISODate(inicio), hasta: toISODate(today) };
    }

    case "personalizado":
      return personalizado ?? { desde: toISODate(today), hasta: toISODate(today) };

    default:
      return { desde: toISODate(today), hasta: toISODate(today) };
  }
}

/**
 * Rango inmediatamente anterior, de la misma duración que `rango`, usado
 * únicamente para la alerta de "gastos elevados" (sección 22 de la Fase 9):
 * si el rango actual dura N días, el rango anterior son los N días previos
 * al inicio del actual. No implica ningún otro cálculo contable.
 */
export function calcularPeriodoAnterior(rango: RangoFechas): RangoFechas {
  const desde = new Date(`${rango.desde}T00:00:00`);
  const hasta = new Date(`${rango.hasta}T00:00:00`);
  const duracionDias = Math.round((hasta.getTime() - desde.getTime()) / 86_400_000) + 1;

  const nuevaHasta = new Date(desde);
  nuevaHasta.setDate(nuevaHasta.getDate() - 1);
  const nuevaDesde = new Date(nuevaHasta);
  nuevaDesde.setDate(nuevaDesde.getDate() - (duracionDias - 1));

  return { desde: toISODate(nuevaDesde), hasta: toISODate(nuevaHasta) };
}

/** Lista de meses (YYYY-MM + etiqueta corta) cubiertos por el rango, para agrupar el gráfico de ingresos/egresos. */
export function enumerarMeses(rango: RangoFechas): { mes: string; mesLabel: string }[] {
  const inicio = new Date(`${rango.desde}T00:00:00`);
  const fin = new Date(`${rango.hasta}T00:00:00`);

  const meses: { mes: string; mesLabel: string }[] = [];
  const cursor = localDate(inicio.getFullYear(), inicio.getMonth(), 1);
  const limite = localDate(fin.getFullYear(), fin.getMonth(), 1);

  while (cursor.getTime() <= limite.getTime()) {
    const mes = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}`;
    const mesLabel = cursor.toLocaleDateString("es", { month: "short", year: "2-digit" });
    meses.push({ mes, mesLabel });
    cursor.setMonth(cursor.getMonth() + 1);
  }

  return meses;
}

export function mesDeFecha(fecha: string): string {
  return fecha.slice(0, 7);
}
