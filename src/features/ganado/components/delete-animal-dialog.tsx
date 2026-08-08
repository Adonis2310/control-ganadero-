"use client";

import { useEffect, useState } from "react";
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
import type { Animal } from "@/features/ganado/types";
import { createClient } from "@/lib/supabase/client";
import { animalesService } from "@/services/animales.service";
import { animalPhotoStorage } from "@/services/storage.service";

interface DeleteAnimalDialogProps {
  animal: Animal | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted: (id: string) => void;
}

export function DeleteAnimalDialog({
  animal,
  open,
  onOpenChange,
  onDeleted,
}: DeleteAnimalDialogProps) {
  const [descendientes, setDescendientes] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!open || !animal) {
      setDescendientes(null);
      return;
    }
    const supabase = createClient();
    animalesService
      .countDescendientes(supabase, animal.id)
      .then(setDescendientes)
      .catch(() => setDescendientes(null));
  }, [open, animal]);

  async function handleConfirm() {
    if (!animal) return;
    setIsDeleting(true);
    try {
      const supabase = createClient();
      await animalesService.remove(supabase, animal.id);
      await animalPhotoStorage.remove(animal.foto_url);
      toast.success("Animal eliminado", {
        description: `${animal.identificador} se eliminó correctamente.`,
      });
      onDeleted(animal.id);
      onOpenChange(false);
    } catch {
      toast.error("No se pudo eliminar el animal", {
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
          <DialogTitle>¿Estás seguro de que deseas eliminar este animal?</DialogTitle>
          <DialogDescription>
            {animal && (
              <>
                Vas a eliminar permanentemente a{" "}
                <strong className="text-foreground">
                  {animal.nombre || animal.identificador}
                </strong>{" "}
                (arete {animal.identificador}). Esta acción no debería
                utilizarse para animales vendidos o fallecidos — para esos
                casos, edita el animal y cambia su estado en vez de
                eliminarlo.
                {descendientes !== null && descendientes > 0 && (
                  <span className="mt-2 block text-amber-700 dark:text-amber-400">
                    Este animal es padre o madre de {descendientes}{" "}
                    {descendientes === 1 ? "animal registrado" : "animales registrados"}.
                    Ese vínculo se perderá si continúas.
                  </span>
                )}
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isDeleting}
          >
            {isDeleting && <Loader2 className="size-4 animate-spin" />}
            Eliminar animal
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
