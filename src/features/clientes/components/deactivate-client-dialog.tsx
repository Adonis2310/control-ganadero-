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
import type { ClienteRow } from "@/features/clientes/types";
import { createClient } from "@/lib/supabase/client";
import { clientesService } from "@/services/clientes.service";

interface DeactivateClientDialogProps {
  cliente: ClienteRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeactivated: (id: string) => void;
}

export function DeactivateClientDialog({ cliente, open, onOpenChange, onDeactivated }: DeactivateClientDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleConfirm() {
    if (!cliente) return;
    setIsSubmitting(true);
    try {
      const supabase = createClient();
      await clientesService.setActivo(supabase, cliente.id, false);
      toast.success("Cliente desactivado");
      onDeactivated(cliente.id);
      onOpenChange(false);
    } catch {
      toast.error("No se pudo desactivar el cliente", { description: "Intenta nuevamente en unos segundos." });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>¿Desactivar este cliente?</DialogTitle>
          <DialogDescription>
            {cliente && (
              <>
                <strong className="text-foreground">{cliente.nombre}</strong> ya no aparecerá como
                opción al crear nuevas ventas, pero su historial se conserva. Podrás activarlo de
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
            Desactivar cliente
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
