"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DeleteDewormingDialog } from "@/features/ganado/components/delete-deworming-dialog";
import { DeleteDiseaseDialog } from "@/features/ganado/components/delete-disease-dialog";
import { DeleteTreatmentDialog } from "@/features/ganado/components/delete-treatment-dialog";
import { DeleteVaccineDialog } from "@/features/ganado/components/delete-vaccine-dialog";
import { DewormingFormDialog } from "@/features/ganado/components/deworming-form-dialog";
import { DewormingTable } from "@/features/ganado/components/deworming-table";
import { DiseaseFormDialog } from "@/features/ganado/components/disease-form-dialog";
import { DiseaseTable } from "@/features/ganado/components/disease-table";
import { HealthAlerts } from "@/features/ganado/components/health-alerts";
import { HealthEmptyState } from "@/features/ganado/components/health-empty-state";
import { HealthSummary } from "@/features/ganado/components/health-summary";
import { HealthTimeline } from "@/features/ganado/components/health-timeline";
import { RecoverDiseaseDialog } from "@/features/ganado/components/recover-disease-dialog";
import { TreatmentFormDialog } from "@/features/ganado/components/treatment-form-dialog";
import { TreatmentTable } from "@/features/ganado/components/treatment-table";
import { VaccineFormDialog } from "@/features/ganado/components/vaccine-form-dialog";
import { VaccineTable } from "@/features/ganado/components/vaccine-table";
import type {
  DesparasitacionRow,
  EnfermedadRow,
  TratamientoConEnfermedad,
  VacunaRow,
} from "@/features/ganado/types";
import {
  calcularAlertasAnimal,
  calcularResumenSalud,
  construirTimelineAnimal,
} from "@/features/ganado/utils/salud.utils";
import { createClient } from "@/lib/supabase/client";
import { desparasitacionesService } from "@/services/desparasitaciones.service";
import { enfermedadesService } from "@/services/enfermedades.service";
import { tratamientosService } from "@/services/tratamientos.service";
import { vacunasService } from "@/services/vacunas.service";

interface HealthSectionProps {
  animalId: string;
  vacunasIniciales: VacunaRow[];
  desparasitacionesIniciales: DesparasitacionRow[];
  enfermedadesIniciales: EnfermedadRow[];
  tratamientosIniciales: TratamientoConEnfermedad[];
}

function SubsectionHeader({
  titulo,
  onRegistrar,
  label,
}: {
  titulo: string;
  onRegistrar: () => void;
  label: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <h4 className="text-sm font-medium text-muted-foreground">{titulo}</h4>
      <Button size="sm" variant="outline" onClick={onRegistrar}>
        <Plus className="size-4" />
        {label}
      </Button>
    </div>
  );
}

function SubsectionEmpty({ mensaje }: { mensaje: string }) {
  return (
    <p className="rounded-xl border border-dashed py-8 text-center text-sm text-muted-foreground">
      {mensaje}
    </p>
  );
}

export function HealthSection({
  animalId,
  vacunasIniciales,
  desparasitacionesIniciales,
  enfermedadesIniciales,
  tratamientosIniciales,
}: HealthSectionProps) {
  const router = useRouter();

  const [vacunas, setVacunas] = useState(vacunasIniciales);
  const [desparasitaciones, setDesparasitaciones] = useState(desparasitacionesIniciales);
  const [enfermedades, setEnfermedades] = useState(enfermedadesIniciales);
  const [tratamientos, setTratamientos] = useState(tratamientosIniciales);

  const [vacunaFormOpen, setVacunaFormOpen] = useState(false);
  const [vacunaEnEdicion, setVacunaEnEdicion] = useState<VacunaRow | null>(null);
  const [vacunaAEliminar, setVacunaAEliminar] = useState<VacunaRow | null>(null);

  const [desparasitacionFormOpen, setDesparasitacionFormOpen] = useState(false);
  const [desparasitacionEnEdicion, setDesparasitacionEnEdicion] =
    useState<DesparasitacionRow | null>(null);
  const [desparasitacionAEliminar, setDesparasitacionAEliminar] =
    useState<DesparasitacionRow | null>(null);

  const [enfermedadFormOpen, setEnfermedadFormOpen] = useState(false);
  const [enfermedadEnEdicion, setEnfermedadEnEdicion] = useState<EnfermedadRow | null>(null);
  const [enfermedadAEliminar, setEnfermedadAEliminar] = useState<EnfermedadRow | null>(null);
  const [enfermedadARecuperar, setEnfermedadARecuperar] = useState<EnfermedadRow | null>(null);

  const [tratamientoFormOpen, setTratamientoFormOpen] = useState(false);
  const [tratamientoEnEdicion, setTratamientoEnEdicion] = useState<TratamientoConEnfermedad | null>(
    null,
  );
  const [tratamientoAEliminar, setTratamientoAEliminar] = useState<TratamientoConEnfermedad | null>(
    null,
  );

  const summary = calcularResumenSalud(vacunas, desparasitaciones, enfermedades, tratamientos);
  const alertas = calcularAlertasAnimal(vacunas, desparasitaciones, enfermedades);
  const timeline = construirTimelineAnimal(vacunas, desparasitaciones, enfermedades, tratamientos);
  const sinRegistros =
    vacunas.length === 0 &&
    desparasitaciones.length === 0 &&
    enfermedades.length === 0 &&
    tratamientos.length === 0;

  async function recargarTodo() {
    const supabase = createClient();
    const [nuevasVacunas, nuevasDesparasitaciones, nuevasEnfermedades, nuevosTratamientos] =
      await Promise.all([
        vacunasService.listByAnimal(supabase, animalId),
        desparasitacionesService.listByAnimal(supabase, animalId),
        enfermedadesService.listByAnimal(supabase, animalId),
        tratamientosService.listByAnimal(supabase, animalId),
      ]);
    setVacunas(nuevasVacunas);
    setDesparasitaciones(nuevasDesparasitaciones);
    setEnfermedades(nuevasEnfermedades);
    setTratamientos(nuevosTratamientos);
    router.refresh();
  }

  function abrirVacunaCrear() {
    setVacunaEnEdicion(null);
    setVacunaFormOpen(true);
  }
  function abrirDesparasitacionCrear() {
    setDesparasitacionEnEdicion(null);
    setDesparasitacionFormOpen(true);
  }
  function abrirEnfermedadCrear() {
    setEnfermedadEnEdicion(null);
    setEnfermedadFormOpen(true);
  }
  function abrirTratamientoCrear() {
    setTratamientoEnEdicion(null);
    setTratamientoFormOpen(true);
  }

  function handleVacunaEliminada(id: string) {
    setVacunas((prev) => prev.filter((v) => v.id !== id));
    router.refresh();
  }
  function handleDesparasitacionEliminada(id: string) {
    setDesparasitaciones((prev) => prev.filter((d) => d.id !== id));
    router.refresh();
  }
  function handleEnfermedadEliminada(id: string) {
    setEnfermedades((prev) => prev.filter((e) => e.id !== id));
    router.refresh();
  }
  function handleTratamientoEliminado(id: string) {
    setTratamientos((prev) => prev.filter((t) => t.id !== id));
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      <HealthAlerts alertas={alertas} />
      <HealthSummary summary={summary} />

      {sinRegistros ? (
        <HealthEmptyState
          onRegistrarVacuna={abrirVacunaCrear}
          onRegistrarDesparasitacion={abrirDesparasitacionCrear}
          onRegistrarEnfermedad={abrirEnfermedadCrear}
        />
      ) : (
        <>
          <div className="flex flex-col gap-3">
            <SubsectionHeader titulo="Vacunas" onRegistrar={abrirVacunaCrear} label="Registrar vacuna" />
            {vacunas.length === 0 ? (
              <SubsectionEmpty mensaje="Este animal todavía no tiene vacunas registradas." />
            ) : (
              <VaccineTable
                vacunas={vacunas}
                onEdit={(v) => {
                  setVacunaEnEdicion(v);
                  setVacunaFormOpen(true);
                }}
                onDelete={setVacunaAEliminar}
              />
            )}
          </div>

          <div className="flex flex-col gap-3">
            <SubsectionHeader
              titulo="Desparasitaciones"
              onRegistrar={abrirDesparasitacionCrear}
              label="Registrar desparasitación"
            />
            {desparasitaciones.length === 0 ? (
              <SubsectionEmpty mensaje="Este animal todavía no tiene desparasitaciones registradas." />
            ) : (
              <DewormingTable
                desparasitaciones={desparasitaciones}
                onEdit={(d) => {
                  setDesparasitacionEnEdicion(d);
                  setDesparasitacionFormOpen(true);
                }}
                onDelete={setDesparasitacionAEliminar}
              />
            )}
          </div>

          <div className="flex flex-col gap-3">
            <SubsectionHeader
              titulo="Enfermedades"
              onRegistrar={abrirEnfermedadCrear}
              label="Registrar enfermedad"
            />
            {enfermedades.length === 0 ? (
              <SubsectionEmpty mensaje="Este animal todavía no tiene enfermedades registradas." />
            ) : (
              <DiseaseTable
                enfermedades={enfermedades}
                onEdit={(e) => {
                  setEnfermedadEnEdicion(e);
                  setEnfermedadFormOpen(true);
                }}
                onDelete={setEnfermedadAEliminar}
                onRecuperar={setEnfermedadARecuperar}
              />
            )}
          </div>

          <div className="flex flex-col gap-3">
            <SubsectionHeader
              titulo="Tratamientos"
              onRegistrar={abrirTratamientoCrear}
              label="Registrar tratamiento"
            />
            {tratamientos.length === 0 ? (
              <SubsectionEmpty mensaje="Este animal todavía no tiene tratamientos registrados." />
            ) : (
              <TreatmentTable
                tratamientos={tratamientos}
                onEdit={(t) => {
                  setTratamientoEnEdicion(t);
                  setTratamientoFormOpen(true);
                }}
                onDelete={setTratamientoAEliminar}
              />
            )}
          </div>

          <HealthTimeline registros={timeline} />
        </>
      )}

      <VaccineFormDialog
        animalId={animalId}
        vacuna={vacunaEnEdicion}
        open={vacunaFormOpen}
        onOpenChange={setVacunaFormOpen}
        onSaved={recargarTodo}
      />
      <DeleteVaccineDialog
        vacuna={vacunaAEliminar}
        open={vacunaAEliminar !== null}
        onOpenChange={(open) => !open && setVacunaAEliminar(null)}
        onDeleted={handleVacunaEliminada}
      />

      <DewormingFormDialog
        animalId={animalId}
        desparasitacion={desparasitacionEnEdicion}
        open={desparasitacionFormOpen}
        onOpenChange={setDesparasitacionFormOpen}
        onSaved={recargarTodo}
      />
      <DeleteDewormingDialog
        desparasitacion={desparasitacionAEliminar}
        open={desparasitacionAEliminar !== null}
        onOpenChange={(open) => !open && setDesparasitacionAEliminar(null)}
        onDeleted={handleDesparasitacionEliminada}
      />

      <DiseaseFormDialog
        animalId={animalId}
        enfermedad={enfermedadEnEdicion}
        open={enfermedadFormOpen}
        onOpenChange={setEnfermedadFormOpen}
        onSaved={recargarTodo}
      />
      <DeleteDiseaseDialog
        enfermedad={enfermedadAEliminar}
        open={enfermedadAEliminar !== null}
        onOpenChange={(open) => !open && setEnfermedadAEliminar(null)}
        onDeleted={handleEnfermedadEliminada}
      />
      <RecoverDiseaseDialog
        enfermedad={enfermedadARecuperar}
        open={enfermedadARecuperar !== null}
        onOpenChange={(open) => !open && setEnfermedadARecuperar(null)}
        onRecovered={recargarTodo}
      />

      <TreatmentFormDialog
        animalId={animalId}
        tratamiento={tratamientoEnEdicion}
        enfermedades={enfermedades}
        open={tratamientoFormOpen}
        onOpenChange={setTratamientoFormOpen}
        onSaved={recargarTodo}
      />
      <DeleteTreatmentDialog
        tratamiento={tratamientoAEliminar}
        open={tratamientoAEliminar !== null}
        onOpenChange={(open) => !open && setTratamientoAEliminar(null)}
        onDeleted={handleTratamientoEliminado}
      />
    </div>
  );
}
