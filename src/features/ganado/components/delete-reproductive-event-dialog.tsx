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
import type { EventoReproductivoRow } from "@/features/ganado/types";
import { TIPO_EVENTO_REPRODUCTIVO_LABEL } from "@/features/ganado/types";
import { formatearFecha } from "@/features/ganado/utils/animal.utils";
import { createClient } from "@/lib/supabase/client";
import { eventosReproductivosService } from "@/services/eventos-reproductivos.service";

interface DeleteReproductiveEventDialogProps {
  evento: EventoReproductivoRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted: (id: string) => void;
}

export function DeleteReproductiveEventDialog({
  evento,
  open,
  onOpenChange,
  onDeleted,
}: DeleteReproductiveEventDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleConfirm() {
    if (!evento) return;
    setIsDeleting(true);
    try {
      const supabase = createClient();
      await eventosReproductivosService.remove(supabase, evento.id);
      toast.success("Registro eliminado");
      onDeleted(evento.id);
      onOpenChange(false);
    } catch {
      toast.error("No se pudo eliminar el registro", {
        description: "Intenta nuevamente en unos segundos.",
      });
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>¿Eliminar este registro?</DialogTitle>
          <DialogDescription>
            {evento && (
              <>
                Vas a eliminar el registro de{" "}
                <strong className="text-foreground">
                  {TIPO_EVENTO_REPRODUCTIVO_LABEL[evento.tipo]}
                </strong>{" "}
                del {formatearFecha(evento.fecha)}. Esta acción no se puede deshacer y no
                revertirá automáticamente el estado de una gestación relacionada.
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isDeleting}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={isDeleting}>
            {isDeleting && <Loader2 className="size-4 animate-spin" />}
            Eliminar registro
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
