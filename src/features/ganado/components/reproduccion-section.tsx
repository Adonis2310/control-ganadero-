"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AbortionFormDialog } from "@/features/ganado/components/abortion-form-dialog";
import { BirthFormDialog } from "@/features/ganado/components/birth-form-dialog";
import { DeleteReproductiveEventDialog } from "@/features/ganado/components/delete-reproductive-event-dialog";
import { HeatFormDialog } from "@/features/ganado/components/heat-form-dialog";
import { InseminationFormDialog } from "@/features/ganado/components/insemination-form-dialog";
import { MatingFormDialog } from "@/features/ganado/components/mating-form-dialog";
import { OffspringFormDialog } from "@/features/ganado/components/offspring-form-dialog";
import { PregnancyCard } from "@/features/ganado/components/pregnancy-card";
import { PregnancyDiagnosisFormDialog } from "@/features/ganado/components/pregnancy-diagnosis-form-dialog";
import { PregnancyTable } from "@/features/ganado/components/pregnancy-table";
import { ReproductiveAlerts } from "@/features/ganado/components/reproductive-alerts";
import { ReproductiveEmptyState } from "@/features/ganado/components/reproductive-empty-state";
import {
  ReproductiveSummaryHembraCards,
  ReproductiveSummaryMachoCards,
} from "@/features/ganado/components/reproductive-summary";
import { ReproductiveTimeline } from "@/features/ganado/components/reproductive-timeline";
import type {
  CriaRef,
  EventoReproductivoRow,
  GestacionRow,
  Raza,
  SexoAnimal,
} from "@/features/ganado/types";
import { formatearFecha } from "@/features/ganado/utils/animal.utils";
import { calcularResumenHembra, calcularResumenMacho } from "@/features/ganado/utils/reproduccion.utils";
import { createClient } from "@/lib/supabase/client";
import { animalesService } from "@/services/animales.service";
import { eventosReproductivosService } from "@/services/eventos-reproductivos.service";
import { gestacionesService } from "@/services/gestaciones.service";

function CriasList({ crias }: { crias: CriaRef[] }) {
  if (crias.length === 0) return null;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Crías ({crias.length})</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {crias.map((cria) => (
          <Link
            key={cria.id}
            href={`/ganado/${cria.id}`}
            className="flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm transition-colors hover:bg-muted/50"
          >
            <div>
              <p className="font-medium">
                {cria.identificador}
                {cria.nombre ? ` — ${cria.nombre}` : ""}
              </p>
              <p className="text-xs text-muted-foreground">
                {cria.sexo === "hembra" ? "Hembra" : "Macho"} · {formatearFecha(cria.fecha_nacimiento)}
              </p>
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}

type EventoDialog = "celo" | "monta" | "inseminacion" | "diagnostico" | "parto" | null;

interface ReproduccionSectionProps {
  animalId: string;
  sexo: SexoAnimal;
  fincaId: string;
  razas: Raza[];
  eventosIniciales: EventoReproductivoRow[];
  gestacionesIniciales: GestacionRow[];
  eventosComoMachoIniciales: EventoReproductivoRow[];
  criasIniciales: CriaRef[];
}

export function ReproduccionSection({
  animalId,
  sexo,
  fincaId,
  razas,
  eventosIniciales,
  gestacionesIniciales,
  eventosComoMachoIniciales,
  criasIniciales,
}: ReproduccionSectionProps) {
  const router = useRouter();
  const [eventos, setEventos] = useState(eventosIniciales);
  const [gestaciones, setGestaciones] = useState(gestacionesIniciales);
  const [eventosComoMacho, setEventosComoMacho] = useState(eventosComoMachoIniciales);
  const [crias, setCrias] = useState(criasIniciales);
  const [machoRefNombre, setMachoRefNombre] = useState<{ id: string; identificador: string; nombre: string | null } | null>(null);

  const [dialogAbierto, setDialogAbierto] = useState<EventoDialog>(null);
  const [eventoEnEdicion, setEventoEnEdicion] = useState<EventoReproductivoRow | null>(null);
  const [montaDesdeMacho, setMontaDesdeMacho] = useState(false);
  const [abortoAbierto, setAbortoAbierto] = useState(false);
  const [eventoAEliminar, setEventoAEliminar] = useState<EventoReproductivoRow | null>(null);

  const [offspringAbierto, setOffspringAbierto] = useState(false);
  const [offspringPadreId, setOffspringPadreId] = useState<string | null>(null);
  const [offspringFecha, setOffspringFecha] = useState<string>(new Date().toISOString().split("T")[0]);

  const resumenHembra = sexo === "hembra" ? calcularResumenHembra(gestaciones, eventos, crias.length) : null;
  const resumenMacho = sexo === "macho" ? calcularResumenMacho(eventosComoMacho, crias.length) : null;
  const gestacionActiva = resumenHembra?.gestacionActual ?? null;

  useEffect(() => {
    if (!gestacionActiva?.macho_id) {
      setMachoRefNombre(null);
      return;
    }
    const supabase = createClient();
    animalesService
      .getRef(supabase, gestacionActiva.macho_id)
      .then(setMachoRefNombre)
      .catch(() => setMachoRefNombre(null));
  }, [gestacionActiva?.macho_id]);

  async function recargarTodo() {
    const supabase = createClient();
    if (sexo === "hembra") {
      const [nuevosEventos, nuevasGestaciones, nuevasCrias] = await Promise.all([
        eventosReproductivosService.listByAnimal(supabase, animalId),
        gestacionesService.listByAnimal(supabase, animalId),
        animalesService.listDescendientes(supabase, animalId),
      ]);
      setEventos(nuevosEventos);
      setGestaciones(nuevasGestaciones);
      setCrias(nuevasCrias);
    } else {
      const [nuevosEventosComoMacho, nuevasCrias] = await Promise.all([
        eventosReproductivosService.listByMacho(supabase, animalId),
        animalesService.listDescendientes(supabase, animalId),
      ]);
      setEventosComoMacho(nuevosEventosComoMacho);
      setCrias(nuevasCrias);
    }
    router.refresh();
  }

  function handleEditar(evento: EventoReproductivoRow) {
    setEventoEnEdicion(evento);
    setMontaDesdeMacho(false);
    if (evento.tipo === "aborto") return; // el aborto no se edita, solo se registra/elimina.
    setDialogAbierto(evento.tipo as EventoDialog);
  }

  function abrirCrear(tipo: EventoDialog) {
    setEventoEnEdicion(null);
    setMontaDesdeMacho(false);
    setDialogAbierto(tipo);
  }

  function abrirMontaDesdeMacho() {
    setEventoEnEdicion(null);
    setMontaDesdeMacho(true);
    setDialogAbierto("monta");
  }

  function abrirOffspring(padreId: string | null, fecha: string) {
    setOffspringPadreId(padreId);
    setOffspringFecha(fecha);
    setOffspringAbierto(true);
  }

  const sinRegistros =
    sexo === "hembra"
      ? eventos.length === 0 && gestaciones.length === 0
      : eventosComoMacho.length === 0 && crias.length === 0;

  return (
    <div className="flex flex-col gap-6">
      {sexo === "hembra" && <ReproductiveAlerts gestacionActual={gestacionActiva} />}

      {resumenHembra && <ReproductiveSummaryHembraCards resumen={resumenHembra} />}
      {resumenMacho && <ReproductiveSummaryMachoCards resumen={resumenMacho} />}

      {sinRegistros ? (
        <ReproductiveEmptyState
          sexo={sexo}
          onRegistrarCelo={() => abrirCrear("celo")}
          onRegistrarMonta={sexo === "hembra" ? () => abrirCrear("monta") : abrirMontaDesdeMacho}
          onRegistrarInseminacion={() => abrirCrear("inseminacion")}
        />
      ) : (
        <>
          <div className="flex flex-wrap gap-2">
            {sexo === "hembra" ? (
              <>
                <Button variant="outline" size="sm" onClick={() => abrirCrear("celo")}>
                  <Plus className="size-4" />
                  Registrar celo
                </Button>
                <Button variant="outline" size="sm" onClick={() => abrirCrear("monta")}>
                  <Plus className="size-4" />
                  Registrar monta
                </Button>
                <Button variant="outline" size="sm" onClick={() => abrirCrear("inseminacion")}>
                  <Plus className="size-4" />
                  Registrar inseminación
                </Button>
                <Button variant="outline" size="sm" onClick={() => abrirCrear("diagnostico")}>
                  <Plus className="size-4" />
                  Registrar diagnóstico
                </Button>
                <Button variant="outline" size="sm" onClick={() => abrirCrear("parto")}>
                  <Plus className="size-4" />
                  Registrar parto
                </Button>
                <Button variant="outline" size="sm" onClick={() => setAbortoAbierto(true)}>
                  <Plus className="size-4" />
                  Registrar aborto
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => abrirOffspring(gestacionActiva?.macho_id ?? null, new Date().toISOString().split("T")[0])}
                >
                  <Plus className="size-4" />
                  Registrar cría
                </Button>
              </>
            ) : (
              <Button variant="outline" size="sm" onClick={abrirMontaDesdeMacho}>
                <Plus className="size-4" />
                Registrar monta
              </Button>
            )}
          </div>

          {sexo === "hembra" && gestacionActiva && (
            <PregnancyCard gestacion={{ ...gestacionActiva, macho: machoRefNombre }} />
          )}

          {sexo === "hembra" && gestaciones.length > 0 && (
            <div className="flex flex-col gap-3">
              <h4 className="text-sm font-medium text-muted-foreground">Historial de gestaciones</h4>
              <PregnancyTable gestaciones={gestaciones} eventos={eventos} />
            </div>
          )}

          <CriasList crias={crias} />

          {sexo === "hembra" && (
            <ReproductiveTimeline
              eventos={eventos}
              onEdit={handleEditar}
              onDelete={setEventoAEliminar}
            />
          )}
        </>
      )}

      {sexo === "hembra" && (
        <>
          <HeatFormDialog
            animalId={animalId}
            evento={dialogAbierto === "celo" ? eventoEnEdicion : null}
            open={dialogAbierto === "celo"}
            onOpenChange={(open) => !open && setDialogAbierto(null)}
            onSaved={recargarTodo}
          />
          <InseminationFormDialog
            animalId={animalId}
            fincaId={fincaId}
            evento={dialogAbierto === "inseminacion" ? eventoEnEdicion : null}
            open={dialogAbierto === "inseminacion"}
            onOpenChange={(open) => !open && setDialogAbierto(null)}
            onSaved={recargarTodo}
          />
          <PregnancyDiagnosisFormDialog
            animalId={animalId}
            evento={dialogAbierto === "diagnostico" ? eventoEnEdicion : null}
            open={dialogAbierto === "diagnostico"}
            onOpenChange={(open) => !open && setDialogAbierto(null)}
            onSaved={recargarTodo}
          />
          <BirthFormDialog
            animalId={animalId}
            evento={dialogAbierto === "parto" ? eventoEnEdicion : null}
            open={dialogAbierto === "parto"}
            onOpenChange={(open) => !open && setDialogAbierto(null)}
            onSaved={recargarTodo}
            onRegistered={(gestacion) => abrirOffspring(gestacion.macho_id, gestacion.fecha_parto ?? offspringFecha)}
          />
          <AbortionFormDialog
            animalId={animalId}
            gestacionesActivas={gestacionActiva ? [gestacionActiva] : []}
            open={abortoAbierto}
            onOpenChange={setAbortoAbierto}
            onSaved={recargarTodo}
          />
          <OffspringFormDialog
            fincaId={fincaId}
            madreId={animalId}
            padreId={offspringPadreId}
            fechaSugerida={offspringFecha}
            razas={razas}
            open={offspringAbierto}
            onOpenChange={setOffspringAbierto}
            onSaved={recargarTodo}
          />
        </>
      )}

      <MatingFormDialog
        animalId={sexo === "hembra" ? animalId : undefined}
        contextoMacho={montaDesdeMacho ? { machoId: animalId } : undefined}
        fincaId={fincaId}
        evento={dialogAbierto === "monta" ? eventoEnEdicion : null}
        open={dialogAbierto === "monta"}
        onOpenChange={(open) => !open && setDialogAbierto(null)}
        onSaved={recargarTodo}
      />

      <DeleteReproductiveEventDialog
        evento={eventoAEliminar}
        open={eventoAEliminar !== null}
        onOpenChange={(open) => !open && setEventoAEliminar(null)}
        onDeleted={(id) => {
          setEventos((prev) => prev.filter((e) => e.id !== id));
          router.refresh();
        }}
      />
    </div>
  );
}
