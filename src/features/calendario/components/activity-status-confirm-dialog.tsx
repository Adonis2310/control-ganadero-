"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ActividadConAnimal, EstadoActividad } from "@/features/calendario/types";
import { createClient } from "@/lib/supabase/client";
import { actividadesService } from "@/services/actividades.service";

interface ActivityStatusConfirmDialogProps {
  actividad: ActividadConAnimal | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChanged: () => void;
  targetEstado: Extract<EstadoActividad, "completada" | "cancelada">;
}

const CONFIG: Record<
  "completada" | "cancelada",
  { titulo: string; descripcion: string; confirmar: string; exito: string; error: string; variant: "default" | "destructive" }
> = {
  completada: {
    titulo: "¿Marcar como completada?",
    descripcion: "La actividad quedará registrada como completada y permanecerá en el historial.",
    confirmar: "Completar actividad",
    exito: "Actividad completada",
    error: "No se pudo completar la actividad",
    variant: "default",
  },
  cancelada: {
    titulo: "¿Cancelar esta actividad?",
    descripcion: "La actividad quedará marcada como cancelada y permanecerá en el historial. No se elimina.",
    confirmar: "Cancelar actividad",
    exito: "Actividad cancelada",
    error: "No se pudo cancelar la actividad",
    variant: "destructive",
  },
};

export function ActivityStatusConfirmDialog({
  actividad,
  open,
  onOpenChange,
  onChanged,
  targetEstado,
}: ActivityStatusConfirmDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const config = CONFIG[targetEstado];

  async function handleConfirm() {
    if (!actividad) return;
    setIsSubmitting(true);
    try {
      const supabase = createClient();
      await actividadesService.cambiarEstado(supabase, actividad.id, targetEstado);
      toast.success(config.exito);
      onChanged();
      onOpenChange(false);
    } catch {
      toast.error(config.error, { description: "Intenta nuevamente en unos segundos." });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{config.titulo}</DialogTitle>
          <DialogDescription>
            {actividad && (
              <>
                <strong className="text-foreground">{actividad.titulo}</strong> — {config.descripcion}
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Volver
          </Button>
          <Button variant={config.variant} onClick={handleConfirm} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="size-4 animate-spin" />}
            {config.confirmar}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
