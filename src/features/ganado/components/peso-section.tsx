"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DeletePesoDialog } from "@/features/ganado/components/delete-peso-dialog";
import { PesoEmptyState } from "@/features/ganado/components/peso-empty-state";
import { PesoFormDialog } from "@/features/ganado/components/peso-form-dialog";
import { PesoHistoryMobile } from "@/features/ganado/components/peso-history-mobile";
import { PesoHistoryTable } from "@/features/ganado/components/peso-history-table";
import { PesoStatsCards } from "@/features/ganado/components/peso-stats";
import type { PesoConVariacion, PesoRow } from "@/features/ganado/types";
import { calcularPesoStats, calcularVariaciones } from "@/features/ganado/utils/peso.utils";
import { createClient } from "@/lib/supabase/client";
import { pesosService } from "@/services/pesos.service";

// recharts es una dependencia pesada; se carga solo cuando esta sección
// realmente se renderiza (pestaña "Peso"), no en el bundle inicial de la ficha.
const PesoChart = dynamic(
  () => import("@/features/ganado/components/peso-chart").then((m) => m.PesoChart),
  { ssr: false, loading: () => <Skeleton className="h-64 w-full rounded-xl" /> },
);

export function PesoSection({
  animalId,
  pesosIniciales,
}: {
  animalId: string;
  pesosIniciales: PesoRow[];
}) {
  const router = useRouter();
  const [pesos, setPesos] = useState(pesosIniciales);
  const [formOpen, setFormOpen] = useState(false);
  const [pesoEnEdicion, setPesoEnEdicion] = useState<PesoConVariacion | null>(null);
  const [pesoAEliminar, setPesoAEliminar] = useState<PesoConVariacion | null>(null);

  const conVariacion = calcularVariaciones(pesos);
  const stats = calcularPesoStats(pesos);

  async function recargar() {
    const supabase = createClient();
    const data = await pesosService.listByAnimal(supabase, animalId);
    setPesos(data);
    router.refresh();
  }

  function abrirParaCrear() {
    setPesoEnEdicion(null);
    setFormOpen(true);
  }

  function abrirParaEditar(peso: PesoConVariacion) {
    setPesoEnEdicion(peso);
    setFormOpen(true);
  }

  function handleEliminado(id: string) {
    setPesos((prev) => prev.filter((p) => p.id !== id));
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold tracking-tight">Control de peso</h3>
        <Button onClick={abrirParaCrear}>
          <Plus className="size-4" />
          Registrar peso
        </Button>
      </div>

      {pesos.length === 0 ? (
        <PesoEmptyState onRegistrar={abrirParaCrear} />
      ) : (
        <>
          <PesoStatsCards stats={stats} />
          <PesoChart pesos={pesos} />
          <div>
            <h4 className="mb-3 text-sm font-medium text-muted-foreground">
              Historial de pesajes
            </h4>
            <PesoHistoryTable
              pesos={conVariacion}
              onEdit={abrirParaEditar}
              onDelete={setPesoAEliminar}
            />
            <PesoHistoryMobile
              pesos={conVariacion}
              onEdit={abrirParaEditar}
              onDelete={setPesoAEliminar}
            />
          </div>
        </>
      )}

      <PesoFormDialog
        animalId={animalId}
        peso={pesoEnEdicion}
        open={formOpen}
        onOpenChange={setFormOpen}
        onSaved={recargar}
      />

      <DeletePesoDialog
        peso={pesoAEliminar}
        open={pesoAEliminar !== null}
        onOpenChange={(open) => {
          if (!open) setPesoAEliminar(null);
        }}
        onDeleted={handleEliminado}
      />
    </div>
  );
}
