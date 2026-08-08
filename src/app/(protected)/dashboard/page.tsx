import type { Metadata } from "next";
import { Beef, Boxes, CalendarClock, DollarSign } from "lucide-react";

import { StatCard } from "@/features/dashboard/components/stat-card";
import { ChartPlaceholder } from "@/features/dashboard/components/chart-placeholder";
import type { StatCardData } from "@/features/dashboard/types";
import { SaludDashboardAlerts } from "@/features/ganado/components/salud-dashboard-alerts";
import { FARM_NAME } from "@/lib/constants/farm";
import { createClient } from "@/lib/supabase/server";
import { fincaService } from "@/services/finca.service";
import { saludService } from "@/services/salud.service";

export const metadata: Metadata = {
  title: "Dashboard | Control Ganadero",
};

const STATS: StatCardData[] = [
  {
    label: "Total de animales",
    value: "0",
    change: "Sin datos aún",
    trend: "neutral",
    icon: Beef,
  },
  {
    label: "Ingresos del mes",
    value: "$0.00",
    change: "+0% vs. mes anterior",
    trend: "neutral",
    icon: DollarSign,
  },
  {
    label: "Ítems en inventario",
    value: "0",
    change: "Sin movimientos",
    trend: "neutral",
    icon: Boxes,
  },
  {
    label: "Eventos próximos",
    value: "0",
    change: "Calendario vacío",
    trend: "neutral",
    icon: CalendarClock,
  },
];

const today = new Intl.DateTimeFormat("es-ES", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
}).format(new Date());

export default async function DashboardPage() {
  const formattedDate = today.charAt(0).toUpperCase() + today.slice(1);

  const supabase = await createClient();
  const finca = await fincaService.getOrCreate(supabase);
  const alertasSalud = await saludService.getDashboardAlerts(supabase, finca.id);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Bienvenido, {FARM_NAME}
          </h1>
          <p className="text-sm text-muted-foreground">
            Resumen general de la operación ganadera
          </p>
        </div>
        <p className="text-sm text-muted-foreground">{formattedDate}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {STATS.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <ChartPlaceholder
          title="Producción mensual"
          description="Evolución de la producción a lo largo del año"
        />
        <SaludDashboardAlerts alertas={alertasSalud} />
      </div>
    </div>
  );
}
