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
import type { EnfermedadRow } from "@/features/ganado/types";
import { createClient } from "@/lib/supabase/client";
import { enfermedadesService } from "@/services/enfermedades.service";

interface DeleteDiseaseDialogProps {
  enfermedad: EnfermedadRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted: (id: string) => void;
}

export function DeleteDiseaseDialog({
  enfermedad,
  open,
  onOpenChange,
  onDeleted,
}: DeleteDiseaseDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleConfirm() {
    if (!enfermedad) return;
    setIsDeleting(true);
    try {
      const supabase = createClient();
      await enfermedadesService.remove(supabase, enfermedad.id);
      toast.success("Enfermedad eliminada");
      onDeleted(enfermedad.id);
      onOpenChange(false);
    } catch {
      toast.error("No se pudo eliminar la enfermedad", {
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
          <DialogTitle>¿Eliminar esta enfermedad?</DialogTitle>
          <DialogDescription>
            {enfermedad && (
              <>
                Vas a eliminar el registro de{" "}
                <strong className="text-foreground">{enfermedad.enfermedad}</strong>. Esto también
                desvinculará los tratamientos asociados. Esta acción no se puede deshacer.
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
            Eliminar enfermedad
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
