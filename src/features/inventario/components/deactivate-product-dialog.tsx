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
import type { ProductoInventario } from "@/features/inventario/types";
import { createClient } from "@/lib/supabase/client";
import { productosInventarioService } from "@/services/productos-inventario.service";

interface DeactivateProductDialogProps {
  producto: ProductoInventario | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeactivated: (id: string) => void;
}

export function DeactivateProductDialog({
  producto,
  open,
  onOpenChange,
  onDeactivated,
}: DeactivateProductDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleConfirm() {
    if (!producto) return;
    setIsSubmitting(true);
    try {
      const supabase = createClient();
      await productosInventarioService.setActivo(supabase, producto.id, false);
      toast.success("Producto desactivado");
      onDeactivated(producto.id);
      onOpenChange(false);
    } catch {
      toast.error("No se pudo desactivar el producto", {
        description: "Intenta nuevamente en unos segundos.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>¿Desactivar este producto?</DialogTitle>
          <DialogDescription>
            {producto && (
              <>
                <strong className="text-foreground">{producto.nombre}</strong> dejará de aparecer
                en los listados activos, pero su historial de movimientos se conserva. Podrás
                activarlo de nuevo cuando quieras.
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
            Desactivar producto
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
