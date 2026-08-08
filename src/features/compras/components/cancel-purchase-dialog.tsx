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

interface CancelPurchaseDialogProps {
  compra: CompraRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCancelled: () => void;
}

export function CancelPurchaseDialog({ compra, open, onOpenChange, onCancelled }: CancelPurchaseDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleConfirm() {
    if (!compra) return;
    setIsSubmitting(true);
    try {
      const supabase = createClient();
      await comprasService.cancelar(supabase, compra.id);
      toast.success("Compra cancelada");
      onCancelled();
      onOpenChange(false);
    } catch {
      toast.error("No se pudo cancelar la compra", { description: "Intenta nuevamente en unos segundos." });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>¿Cancelar esta compra?</DialogTitle>
          <DialogDescription>
            {compra && (
              <>
                La compra <strong className="text-foreground">{formatearNumeroCompra(compra.numero)}</strong> se
                marcará como cancelada y no podrá editarse ni recibirse. Esta acción no se puede
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
            Cancelar compra
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
