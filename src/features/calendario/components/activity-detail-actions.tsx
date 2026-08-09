"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CalendarClock, CheckCircle2, Pencil, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ActivityFormDialog } from "@/features/calendario/components/activity-form-dialog";
import { ActivityStatusConfirmDialog } from "@/features/calendario/components/activity-status-confirm-dialog";
import { RescheduleActivityDialog } from "@/features/calendario/components/reschedule-activity-dialog";
import type { ActividadConAnimal } from "@/features/calendario/types";
import type { AnimalRef } from "@/features/ganado/types";

interface ActivityDetailActionsProps {
  actividad: ActividadConAnimal;
  animales: AnimalRef[];
  fincaId: string;
}

export function ActivityDetailActions({ actividad, animales, fincaId }: ActivityDetailActionsProps) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [completeOpen, setCompleteOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);

  const finalizada = actividad.estado === "completada" || actividad.estado === "cancelada";

  function handleChanged() {
    router.refresh();
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
        <Pencil className="size-4" />
        Editar
      </Button>
      <Button variant="outline" size="sm" onClick={() => setRescheduleOpen(true)} disabled={finalizada}>
        <CalendarClock className="size-4" />
        Reprogramar
      </Button>
      <Button size="sm" onClick={() => setCompleteOpen(true)} disabled={finalizada}>
        <CheckCircle2 className="size-4" />
        Completar
      </Button>
      <Button variant="destructive" size="sm" onClick={() => setCancelOpen(true)} disabled={finalizada}>
        <XCircle className="size-4" />
        Cancelar
      </Button>

      <ActivityFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        mode="edit"
        actividad={actividad}
        animales={animales}
        fincaId={fincaId}
        onSaved={handleChanged}
      />
      <RescheduleActivityDialog
        actividad={rescheduleOpen ? actividad : null}
        open={rescheduleOpen}
        onOpenChange={setRescheduleOpen}
        onRescheduled={handleChanged}
      />
      <ActivityStatusConfirmDialog
        actividad={completeOpen ? actividad : null}
        open={completeOpen}
        onOpenChange={setCompleteOpen}
        onChanged={handleChanged}
        targetEstado="completada"
      />
      <ActivityStatusConfirmDialog
        actividad={cancelOpen ? actividad : null}
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        onChanged={handleChanged}
        targetEstado="cancelada"
      />
    </div>
  );
}
