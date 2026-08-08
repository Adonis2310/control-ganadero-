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

interface RevertSaleDialogProps {
  venta: VentaRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReverted: () => void;
}

export function RevertSaleDialog({ venta, open, onOpenChange, onReverted }: RevertSaleDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleConfirm() {
    if (!venta) return;
    setIsSubmitting(true);
    try {
      const supabase = createClient();
      await ventasService.revertir(supabase, venta.id);
      toast.success("Venta revertida", {
        description: "Se devolvió el stock al inventario y se reactivaron los animales.",
      });
      onReverted();
      onOpenChange(false);
    } catch {
      toast.error("No se pudo revertir la venta", { description: "Intenta nuevamente en unos segundos." });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>¿Revertir esta venta completada?</DialogTitle>
          <DialogDescription>
            {venta && (
              <>
                Se devolverán al inventario los productos vendidos en{" "}
                <strong className="text-foreground">{formatearNumeroVenta(venta.numero)}</strong> (como
                una entrada compensatoria, sin borrar el historial), los animales vendidos volverán
                a estado &ldquo;Activo&rdquo;, y la venta quedará marcada como cancelada. Esta acción no se
                puede deshacer.
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
            Revertir venta
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
