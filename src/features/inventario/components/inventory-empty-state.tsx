import Link from "next/link";
import { Boxes } from "lucide-react";

import { Button } from "@/components/ui/button";

export function InventoryEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-20 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-muted">
        <Boxes className="size-6 text-muted-foreground" />
      </div>
      <div className="space-y-1">
        <p className="font-medium">No hay productos registrados en el inventario.</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          Registra tu primer producto para empezar a controlar existencias, entradas y salidas.
        </p>
      </div>
      <Button nativeButton={false} render={<Link href="/inventario/nuevo" />}>
        + Agregar primer producto
      </Button>
    </div>
  );
}
