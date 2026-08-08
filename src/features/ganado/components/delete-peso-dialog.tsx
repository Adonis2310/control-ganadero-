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
import type { PesoRow } from "@/features/ganado/types";
import { formatearFecha } from "@/features/ganado/utils/animal.utils";
import { createClient } from "@/lib/supabase/client";
import { pesosService } from "@/services/pesos.service";

interface DeletePesoDialogProps {
  peso: PesoRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted: (id: string) => void;
}

export function DeletePesoDialog({ peso, open, onOpenChange, onDeleted }: DeletePesoDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleConfirm() {
    if (!peso) return;
    setIsDeleting(true);
    try {
      const supabase = createClient();
      await pesosService.remove(supabase, peso.id);
      toast.success("Pesaje eliminado");
      onDeleted(peso.id);
      onOpenChange(false);
    } catch {
      toast.error("No se pudo eliminar el pesaje", {
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
          <DialogTitle>¿Eliminar este pesaje?</DialogTitle>
          <DialogDescription>
            {peso && (
              <>
                Vas a eliminar el registro de{" "}
                <strong className="text-foreground">{peso.peso} kg</strong> del{" "}
                {formatearFecha(peso.fecha)}. Esta acción no se puede deshacer.
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
            Eliminar pesaje
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
