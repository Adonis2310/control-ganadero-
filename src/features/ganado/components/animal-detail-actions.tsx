"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DeleteAnimalDialog } from "@/features/ganado/components/delete-animal-dialog";
import type { Animal } from "@/features/ganado/types";

export function AnimalDetailActions({ animal }: { animal: Animal }) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <div className="flex gap-2">
        <Button
          variant="outline"
          nativeButton={false}
          render={<Link href={`/ganado/${animal.id}/editar`} />}
        >
          <Pencil className="size-4" />
          Editar
        </Button>
        <Button
          variant="outline"
          className="text-destructive hover:text-destructive"
          onClick={() => setDialogOpen(true)}
        >
          <Trash2 className="size-4" />
          Eliminar
        </Button>
      </div>

      <DeleteAnimalDialog
        animal={dialogOpen ? animal : null}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onDeleted={() => {
          router.push("/ganado");
          router.refresh();
        }}
      />
    </>
  );
}
