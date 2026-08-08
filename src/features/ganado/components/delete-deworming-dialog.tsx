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
import type { DesparasitacionRow } from "@/features/ganado/types";
import { createClient } from "@/lib/supabase/client";
import { desparasitacionesService } from "@/services/desparasitaciones.service";

interface DeleteDewormingDialogProps {
  desparasitacion: DesparasitacionRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted: (id: string) => void;
}

export function DeleteDewormingDialog({
  desparasitacion,
  open,
  onOpenChange,
  onDeleted,
}: DeleteDewormingDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleConfirm() {
    if (!desparasitacion) return;
    setIsDeleting(true);
    try {
      const supabase = createClient();
      await desparasitacionesService.remove(supabase, desparasitacion.id);
      toast.success("Desparasitación eliminada");
      onDeleted(desparasitacion.id);
      onOpenChange(false);
    } catch {
      toast.error("No se pudo eliminar la desparasitación", {
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
          <DialogTitle>¿Eliminar esta desparasitación?</DialogTitle>
          <DialogDescription>
            {desparasitacion && (
              <>
                Vas a eliminar el registro de{" "}
                <strong className="text-foreground">{desparasitacion.producto}</strong>. Esta
                acción no se puede deshacer.
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
            Eliminar desparasitación
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
