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
import type { TratamientoConEnfermedad } from "@/features/ganado/types";
import { createClient } from "@/lib/supabase/client";
import { tratamientosService } from "@/services/tratamientos.service";

interface DeleteTreatmentDialogProps {
  tratamiento: TratamientoConEnfermedad | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted: (id: string) => void;
}

export function DeleteTreatmentDialog({
  tratamiento,
  open,
  onOpenChange,
  onDeleted,
}: DeleteTreatmentDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleConfirm() {
    if (!tratamiento) return;
    setIsDeleting(true);
    try {
      const supabase = createClient();
      await tratamientosService.remove(supabase, tratamiento.id);
      toast.success("Tratamiento eliminado");
      onDeleted(tratamiento.id);
      onOpenChange(false);
    } catch {
      toast.error("No se pudo eliminar el tratamiento", {
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
          <DialogTitle>¿Eliminar este tratamiento?</DialogTitle>
          <DialogDescription>
            {tratamiento && (
              <>
                Vas a eliminar el registro de{" "}
                <strong className="text-foreground">{tratamiento.tratamiento}</strong>. Esta
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
            Eliminar tratamiento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
