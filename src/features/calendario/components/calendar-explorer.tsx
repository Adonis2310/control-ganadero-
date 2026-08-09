"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { CalendarPlus, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ActivityFormDialog } from "@/features/calendario/components/activity-form-dialog";
import { ActivityHistory } from "@/features/calendario/components/activity-history";
import { CalendarAlerts } from "@/features/calendario/components/calendar-alerts";
import { CalendarFilters } from "@/features/calendario/components/calendar-filters";
import { CalendarStats } from "@/features/calendario/components/calendar-stats";
import { CalendarView } from "@/features/calendario/components/calendar-view";
import { OverdueActivities } from "@/features/calendario/components/overdue-activities";
import { TodayActivities } from "@/features/calendario/components/today-activities";
import { UpcomingActivities } from "@/features/calendario/components/upcoming-activities";
import { useActividadFilters } from "@/features/calendario/hooks/use-actividad-filters";
import type { ActividadConAnimal, CalendarEvent } from "@/features/calendario/types";
import { calcularActividadStats, combinarEventos, construirEventosDesdeActividades } from "@/features/calendario/utils/actividad.utils";
import { useSystemSettings } from "@/features/configuracion/hooks/use-configuracion";
import type { AnimalRef } from "@/features/ganado/types";

interface CalendarExplorerProps {
  actividadesIniciales: ActividadConAnimal[];
  eventosDerivados: CalendarEvent[];
  animales: AnimalRef[];
  fincaId: string;
}

export function CalendarExplorer({ actividadesIniciales, eventosDerivados, animales, fincaId }: CalendarExplorerProps) {
  const router = useRouter();
  const { primer_dia_semana: primerDiaSemana, horario_inicio: horarioInicio, horario_fin: horarioFin } = useSystemSettings();
  const { filters, setFilters, filtered, hasActiveFilters, clearFilters } = useActividadFilters(actividadesIniciales);
  const [formOpen, setFormOpen] = useState(false);

  const stats = useMemo(() => calcularActividadStats(actividadesIniciales), [actividadesIniciales]);

  const eventosSinFiltrar = useMemo(
    () => combinarEventos(construirEventosDesdeActividades(actividadesIniciales), eventosDerivados),
    [actividadesIniciales, eventosDerivados],
  );

  const eventosFiltrados = useMemo(
    () => combinarEventos(construirEventosDesdeActividades(filtered), eventosDerivados),
    [filtered, eventosDerivados],
  );

  const actividadesPorId = useMemo(() => new Map(actividadesIniciales.map((a) => [a.id, a])), [actividadesIniciales]);

  function handleChanged() {
    router.refresh();
  }

  if (eventosSinFiltrar.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-20 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-muted">
            <CalendarPlus className="size-6 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <p className="font-medium">No hay actividades programadas.</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Crea tu primera actividad para empezar a organizar la agenda de la finca.
            </p>
          </div>
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="size-4" />
            Crear actividad
          </Button>
        </div>

        <ActivityFormDialog
          open={formOpen}
          onOpenChange={setFormOpen}
          mode="create"
          animales={animales}
          fincaId={fincaId}
          onSaved={handleChanged}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <CalendarAlerts stats={stats} />

      <CalendarStats stats={stats} />

      <div className="flex justify-end">
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="size-4" />
          Nueva actividad
        </Button>
      </div>

      <CalendarFilters
        filters={filters}
        onFiltersChange={setFilters}
        animales={animales}
        hasActiveFilters={hasActiveFilters}
        onClear={clearFilters}
      />

      <Tabs defaultValue="calendario">
        <TabsList>
          <TabsTrigger value="calendario">Calendario</TabsTrigger>
          <TabsTrigger value="hoy">Hoy</TabsTrigger>
          <TabsTrigger value="proximas">Próximas</TabsTrigger>
          <TabsTrigger value="vencidas">Vencidas</TabsTrigger>
          <TabsTrigger value="historial">Historial</TabsTrigger>
        </TabsList>

        <TabsContent value="calendario" className="flex flex-col gap-2 pt-4">
          <p className="text-xs text-muted-foreground">
            Horario laboral: {horarioInicio.slice(0, 5)} – {horarioFin.slice(0, 5)} (solo referencia visual, no limita el registro de actividades)
          </p>
          <CalendarView eventos={eventosFiltrados} primerDiaSemana={primerDiaSemana} />
        </TabsContent>
        <TabsContent value="hoy" className="pt-4">
          <TodayActivities eventos={eventosSinFiltrar} />
        </TabsContent>
        <TabsContent value="proximas" className="pt-4">
          <UpcomingActivities eventos={eventosSinFiltrar} />
        </TabsContent>
        <TabsContent value="vencidas" className="pt-4">
          <OverdueActivities eventos={eventosSinFiltrar} actividadesPorId={actividadesPorId} onChanged={handleChanged} />
        </TabsContent>
        <TabsContent value="historial" className="pt-4">
          <ActivityHistory eventos={eventosSinFiltrar} />
        </TabsContent>
      </Tabs>

      <ActivityFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        mode="create"
        animales={animales}
        fincaId={fincaId}
        onSaved={handleChanged}
      />
    </div>
  );
}
