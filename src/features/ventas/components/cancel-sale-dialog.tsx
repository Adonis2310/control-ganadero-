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
import type { VentaRow } from "@/features/ventas/types";
import { formatearNumeroVenta } from "@/features/ventas/utils/venta.utils";
import { createClient } from "@/lib/supabase/client";
import { ventasService } from "@/services/ventas.service";

interface CancelSaleDialogProps {
  venta: VentaRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCancelled: () => void;
}

export function CancelSaleDialog({ venta, open, onOpenChange, onCancelled }: CancelSaleDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleConfirm() {
    if (!venta) return;
    setIsSubmitting(true);
    try {
      const supabase = createClient();
      await ventasService.cancelar(supabase, venta.id);
      toast.success("Venta cancelada");
      onCancelled();
      onOpenChange(false);
    } catch {
      toast.error("No se pudo cancelar la venta", { description: "Intenta nuevamente en unos segundos." });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>¿Cancelar esta venta?</DialogTitle>
          <DialogDescription>
            {venta && (
              <>
                La venta <strong className="text-foreground">{formatearNumeroVenta(venta.numero)}</strong> se
                marcará como cancelada y no podrá editarse ni completarse. Esta acción no se puede
                deshacer.
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Volver
          </Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="size-4 animate-spin" />}
            Cancelar venta
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
