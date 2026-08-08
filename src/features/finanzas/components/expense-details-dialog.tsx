import type { ReactNode } from "react";
import Link from "next/link";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatearMoneda } from "@/features/inventario/utils/inventario.utils";
import type { GastoConReferencias } from "@/features/finanzas/types";
import { formatearFecha } from "@/features/ganado/utils/animal.utils";

function Campo({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <div className="mt-1 text-sm">{value}</div>
    </div>
  );
}

interface ExpenseDetailsDialogProps {
  gasto: GastoConReferencias | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ExpenseDetailsDialog({ gasto, open, onOpenChange }: ExpenseDetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-lg sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Detalle del gasto</DialogTitle>
          <DialogDescription>Información completa del gasto registrado.</DialogDescription>
        </DialogHeader>
        {gasto && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo label="Categoría" value={gasto.categoria?.nombre ?? "Sin categoría"} />
            <Campo label="Monto" value={formatearMoneda(gasto.monto)} />
            <Campo label="Fecha" value={formatearFecha(gasto.fecha)} />
            <Campo label="Método de pago" value={gasto.metodo_pago || "Sin especificar"} />
            <Campo
              label="Proveedor"
              value={
                gasto.proveedor ? (
                  <Link href={`/proveedores/${gasto.proveedor.id}`} className="text-primary hover:underline">
                    {gasto.proveedor.nombre}
                  </Link>
                ) : (
                  "Sin registrar"
                )
              }
            />
            <Campo
              label="Animal"
              value={
                gasto.animal ? (
                  <Link href={`/ganado/${gasto.animal.id}`} className="text-primary hover:underline">
                    {gasto.animal.identificador}
                    {gasto.animal.nombre ? ` — ${gasto.animal.nombre}` : ""}
                  </Link>
                ) : (
                  "Sin registrar"
                )
              }
            />
            <div className="sm:col-span-2">
              <p className="text-xs font-medium text-muted-foreground">Descripción</p>
              <p className="mt-1 text-sm whitespace-pre-wrap">{gasto.descripcion}</p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-xs font-medium text-muted-foreground">Observaciones</p>
              <p className="mt-1 text-sm whitespace-pre-wrap">{gasto.observaciones || "Sin observaciones registradas."}</p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
