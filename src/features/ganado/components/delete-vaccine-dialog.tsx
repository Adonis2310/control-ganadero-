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
import type { VacunaRow } from "@/features/ganado/types";
import { createClient } from "@/lib/supabase/client";
import { vacunasService } from "@/services/vacunas.service";

interface DeleteVaccineDialogProps {
  vacuna: VacunaRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted: (id: string) => void;
}

export function DeleteVaccineDialog({
  vacuna,
  open,
  onOpenChange,
  onDeleted,
}: DeleteVaccineDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleConfirm() {
    if (!vacuna) return;
    setIsDeleting(true);
    try {
      const supabase = createClient();
      await vacunasService.remove(supabase, vacuna.id);
      toast.success("Vacuna eliminada");
      onDeleted(vacuna.id);
      onOpenChange(false);
    } catch {
      toast.error("No se pudo eliminar la vacuna", {
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
          <DialogTitle>¿Eliminar esta vacuna?</DialogTitle>
          <DialogDescription>
            {vacuna && (
              <>
                Vas a eliminar el registro de{" "}
                <strong className="text-foreground">{vacuna.nombre}</strong>. Esta acción no se
                puede deshacer.
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
            Eliminar vacuna
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
