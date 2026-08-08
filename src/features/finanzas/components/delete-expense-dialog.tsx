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
import { formatearMoneda } from "@/features/inventario/utils/inventario.utils";
import type { GastoConReferencias } from "@/features/finanzas/types";
import { createClient } from "@/lib/supabase/client";
import { gastosService } from "@/services/gastos.service";

interface DeleteExpenseDialogProps {
  gasto: GastoConReferencias | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted: (id: string) => void;
}

export function DeleteExpenseDialog({ gasto, open, onOpenChange, onDeleted }: DeleteExpenseDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleConfirm() {
    if (!gasto) return;
    setIsSubmitting(true);
    try {
      const supabase = createClient();
      await gastosService.remove(supabase, gasto.id);
      toast.success("Gasto eliminado");
      onDeleted(gasto.id);
      onOpenChange(false);
    } catch {
      toast.error("No se pudo eliminar el gasto", { description: "Intenta nuevamente en unos segundos." });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>¿Eliminar este gasto?</DialogTitle>
          <DialogDescription>
            {gasto && (
              <>
                Se eliminará el gasto <strong className="text-foreground">{gasto.descripcion}</strong> por{" "}
                <strong className="text-foreground">{formatearMoneda(gasto.monto)}</strong>. Esta acción no se
                puede deshacer y afectará el total de gastos y el resultado operativo del período.
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="size-4 animate-spin" />}
            Eliminar gasto
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
