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
import type { ProveedorRow } from "@/features/proveedores/types";
import { createClient } from "@/lib/supabase/client";
import { proveedoresService } from "@/services/proveedores.service";

interface DeactivateSupplierDialogProps {
  proveedor: ProveedorRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeactivated: (id: string) => void;
}

export function DeactivateSupplierDialog({
  proveedor,
  open,
  onOpenChange,
  onDeactivated,
}: DeactivateSupplierDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleConfirm() {
    if (!proveedor) return;
    setIsSubmitting(true);
    try {
      const supabase = createClient();
      await proveedoresService.setActivo(supabase, proveedor.id, false);
      toast.success("Proveedor desactivado");
      onDeactivated(proveedor.id);
      onOpenChange(false);
    } catch {
      toast.error("No se pudo desactivar el proveedor", { description: "Intenta nuevamente en unos segundos." });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>¿Desactivar este proveedor?</DialogTitle>
          <DialogDescription>
            {proveedor && (
              <>
                <strong className="text-foreground">{proveedor.nombre}</strong> ya no aparecerá como
                opción al crear nuevas compras, pero su historial se conserva. Podrás activarlo de
                nuevo cuando quieras.
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
            Desactivar proveedor
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
