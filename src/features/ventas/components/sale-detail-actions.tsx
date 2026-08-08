"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Printer, RotateCcw, PackageCheck, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CancelSaleDialog } from "@/features/ventas/components/cancel-sale-dialog";
import { CompleteSaleDialog } from "@/features/ventas/components/complete-sale-dialog";
import { RevertSaleDialog } from "@/features/ventas/components/revert-sale-dialog";
import type { VentaRow } from "@/features/ventas/types";

export function SaleDetailActions({ venta }: { venta: VentaRow }) {
  const router = useRouter();
  const [completarAbierto, setCompletarAbierto] = useState(false);
  const [cancelarAbierto, setCancelarAbierto] = useState(false);
  const [revertirAbierto, setRevertirAbierto] = useState(false);

  if (venta.estado === "cancelada") return null;

  if (venta.estado === "completada") {
    return (
      <div className="flex flex-wrap gap-2 print:hidden">
        <Button variant="outline" size="sm" onClick={() => window.print()}>
          <Printer className="size-4" />
          Imprimir comprobante
        </Button>
        <Button variant="outline" size="sm" onClick={() => setRevertirAbierto(true)}>
          <RotateCcw className="size-4" />
          Revertir venta
        </Button>

        <RevertSaleDialog
          venta={revertirAbierto ? venta : null}
          open={revertirAbierto}
          onOpenChange={setRevertirAbierto}
          onReverted={() => router.refresh()}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2 print:hidden">
      {venta.estado === "borrador" && (
        <Button variant="outline" size="sm" nativeButton={false} render={<Link href={`/ventas/${venta.id}/editar`} />}>
          <Pencil className="size-4" />
          Editar
        </Button>
      )}
      <Button variant="outline" size="sm" onClick={() => setCompletarAbierto(true)}>
        <PackageCheck className="size-4" />
        Completar
      </Button>
      <Button variant="outline" size="sm" onClick={() => setCancelarAbierto(true)}>
        <XCircle className="size-4" />
        Cancelar
      </Button>

      <CompleteSaleDialog
        venta={completarAbierto ? venta : null}
        open={completarAbierto}
        onOpenChange={setCompletarAbierto}
        onCompleted={() => router.refresh()}
      />
      <CancelSaleDialog
        venta={cancelarAbierto ? venta : null}
        open={cancelarAbierto}
        onOpenChange={setCancelarAbierto}
        onCancelled={() => router.refresh()}
      />
    </div>
  );
}
