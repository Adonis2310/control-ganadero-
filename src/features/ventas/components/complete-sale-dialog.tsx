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

interface CompleteSaleDialogProps {
  venta: VentaRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCompleted: () => void;
}

export function CompleteSaleDialog({ venta, open, onOpenChange, onCompleted }: CompleteSaleDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleConfirm() {
    if (!venta) return;
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const supabase = createClient();
      await ventasService.completar(supabase, venta.id);
      toast.success("Venta completada", {
        description: "Se actualizó el inventario y el estado de los animales vendidos.",
      });
      onCompleted();
      onOpenChange(false);
    } catch (error) {
      const message = (error as { message?: string } | null)?.message ?? "Intenta nuevamente en unos segundos.";
      setErrorMessage(message);
      toast.error("No se pudo completar la venta", { description: message });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>¿Completar esta venta?</DialogTitle>
          <DialogDescription>
            {venta && (
              <>
                Se descontará el stock de los productos, se marcarán los animales como vendidos y
                se actualizará el estado de la venta{" "}
                <strong className="text-foreground">{formatearNumeroVenta(venta.numero)}</strong>. Esta
                acción no se puede deshacer directamente (solo mediante una reversión controlada).
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        {errorMessage && <p className="px-4 text-sm text-destructive">{errorMessage}</p>}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="size-4 animate-spin" />}
            Completar venta
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
