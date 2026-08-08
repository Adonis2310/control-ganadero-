"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, PackageCheck, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CancelPurchaseDialog } from "@/features/compras/components/cancel-purchase-dialog";
import { ReceivePurchaseDialog } from "@/features/compras/components/receive-purchase-dialog";
import type { CompraRow } from "@/features/compras/types";

export function PurchaseDetailActions({ compra }: { compra: CompraRow }) {
  const router = useRouter();
  const [recibirAbierto, setRecibirAbierto] = useState(false);
  const [cancelarAbierto, setCancelarAbierto] = useState(false);

  const puedeEditar = compra.estado === "borrador" || compra.estado === "pendiente";

  if (!puedeEditar) return null;

  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" size="sm" nativeButton={false} render={<Link href={`/compras/${compra.id}/editar`} />}>
        <Pencil className="size-4" />
        Editar
      </Button>
      <Button variant="outline" size="sm" onClick={() => setRecibirAbierto(true)}>
        <PackageCheck className="size-4" />
        Recibir
      </Button>
      <Button variant="outline" size="sm" onClick={() => setCancelarAbierto(true)}>
        <XCircle className="size-4" />
        Cancelar
      </Button>

      <ReceivePurchaseDialog
        compra={recibirAbierto ? compra : null}
        open={recibirAbierto}
        onOpenChange={setRecibirAbierto}
        onReceived={() => router.refresh()}
      />
      <CancelPurchaseDialog
        compra={cancelarAbierto ? compra : null}
        open={cancelarAbierto}
        onOpenChange={setCancelarAbierto}
        onCancelled={() => router.refresh()}
      />
    </div>
  );
}
