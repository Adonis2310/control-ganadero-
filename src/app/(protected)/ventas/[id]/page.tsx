import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SaleDetailActions } from "@/features/ventas/components/sale-detail-actions";
import { SaleDetails } from "@/features/ventas/components/sale-details";
import { SaleStatusBadge } from "@/features/ventas/components/sale-status-badge";
import { formatearNumeroVenta } from "@/features/ventas/utils/venta.utils";
import { formatearFecha } from "@/features/ganado/utils/animal.utils";
import { createClient } from "@/lib/supabase/server";
import { ventasService } from "@/services/ventas.service";

interface VentaDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: VentaDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const venta = await ventasService.getById(supabase, id);
  return {
    title: venta
      ? `Venta ${formatearNumeroVenta(venta.numero)} | Control Ganadero`
      : "Venta no encontrada | Control Ganadero",
  };
}

export default async function VentaDetailPage({ params }: VentaDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const venta = await ventasService.getById(supabase, id);

  if (!venta) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <Button
        variant="ghost"
        size="sm"
        nativeButton={false}
        render={<Link href="/ventas" />}
        className="w-fit text-muted-foreground print:hidden"
      >
        <ArrowLeft className="size-4" />
        Volver a Ventas
      </Button>

      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">
              Venta {formatearNumeroVenta(venta.numero)}
            </h1>
            <SaleStatusBadge estado={venta.estado} />
          </div>
          <p className="text-sm text-muted-foreground">
            {venta.cliente ? (
              <Link href={`/clientes/${venta.cliente.id}`} className="hover:underline">
                {venta.cliente.nombre}
              </Link>
            ) : (
              "Sin cliente"
            )}{" "}
            · {formatearFecha(venta.fecha)}
            {venta.metodo_pago ? ` · ${venta.metodo_pago}` : ""}
          </p>
        </div>
        <SaleDetailActions venta={venta} />
      </div>

      <SaleDetails venta={venta} />
    </div>
  );
}
