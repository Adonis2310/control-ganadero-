import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PurchaseDetailActions } from "@/features/compras/components/purchase-detail-actions";
import { PurchaseDetails } from "@/features/compras/components/purchase-details";
import { PurchaseStatusBadge } from "@/features/compras/components/purchase-status-badge";
import { formatearNumeroCompra } from "@/features/compras/utils/compra.utils";
import { formatearFecha } from "@/features/ganado/utils/animal.utils";
import { createClient } from "@/lib/supabase/server";
import { comprasService } from "@/services/compras.service";

interface CompraDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: CompraDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const compra = await comprasService.getById(supabase, id);
  return {
    title: compra
      ? `Compra ${formatearNumeroCompra(compra.numero)} | Control Ganadero`
      : "Compra no encontrada | Control Ganadero",
  };
}

export default async function CompraDetailPage({ params }: CompraDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const compra = await comprasService.getById(supabase, id);

  if (!compra) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <Button
        variant="ghost"
        size="sm"
        nativeButton={false}
        render={<Link href="/compras" />}
        className="w-fit text-muted-foreground"
      >
        <ArrowLeft className="size-4" />
        Volver a Compras
      </Button>

      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">
              Compra {formatearNumeroCompra(compra.numero)}
            </h1>
            <PurchaseStatusBadge estado={compra.estado} />
          </div>
          <p className="text-sm text-muted-foreground">
            {compra.proveedor ? (
              <Link href={`/proveedores/${compra.proveedor.id}`} className="hover:underline">
                {compra.proveedor.nombre}
              </Link>
            ) : (
              "Sin proveedor"
            )}{" "}
            · {formatearFecha(compra.fecha)}
          </p>
        </div>
        <PurchaseDetailActions compra={compra} />
      </div>

      <PurchaseDetails compra={compra} />
    </div>
  );
}
