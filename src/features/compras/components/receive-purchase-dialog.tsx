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
import type { CompraRow } from "@/features/compras/types";
import { formatearNumeroCompra } from "@/features/compras/utils/compra.utils";
import { createClient } from "@/lib/supabase/client";
import { comprasService } from "@/services/compras.service";

interface ReceivePurchaseDialogProps {
  compra: CompraRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReceived: () => void;
}

export function ReceivePurchaseDialog({ compra, open, onOpenChange, onReceived }: ReceivePurchaseDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleConfirm() {
    if (!compra) return;
    setIsSubmitting(true);
    try {
      const supabase = createClient();
      await comprasService.recibir(supabase, compra.id);
      toast.success("Compra recibida", {
        description: "Se generaron las entradas de inventario correspondientes.",
      });
      onReceived();
      onOpenChange(false);
    } catch {
      toast.error("No se pudo recibir la compra", { description: "Intenta nuevamente en unos segundos." });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>¿Recibir esta compra?</DialogTitle>
          <DialogDescription>
            {compra && (
              <>
                Se generará automáticamente una entrada de inventario por cada producto de la
                compra <strong className="text-foreground">{formatearNumeroCompra(compra.numero)}</strong>{" "}
                y se actualizará el stock. Esta acción no se puede deshacer.
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="size-4 animate-spin" />}
            Recibir compra
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
