import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SupplierDetails, SupplierPurchaseHistory } from "@/features/proveedores/components/supplier-details";
import { calcularProveedorStats } from "@/features/proveedores/utils/proveedor.utils";
import { createClient } from "@/lib/supabase/server";
import { comprasService } from "@/services/compras.service";
import { proveedoresService } from "@/services/proveedores.service";

interface ProveedorDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ProveedorDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const proveedor = await proveedoresService.getById(supabase, id);
  return {
    title: proveedor ? `${proveedor.nombre} | Control Ganadero` : "Proveedor no encontrado | Control Ganadero",
  };
}

export default async function ProveedorDetailPage({ params }: ProveedorDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const proveedor = await proveedoresService.getById(supabase, id);

  if (!proveedor) {
    notFound();
  }

  const compras = await comprasService.listByProveedor(supabase, proveedor.id);
  const stats = calcularProveedorStats(compras);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          nativeButton={false}
          render={<Link href="/proveedores" />}
          className="w-fit text-muted-foreground"
        >
          <ArrowLeft className="size-4" />
          Volver a Proveedores
        </Button>
        <Button variant="outline" size="sm" nativeButton={false} render={<Link href={`/proveedores/${proveedor.id}/editar`} />}>
          <Pencil className="size-4" />
          Editar
        </Button>
      </div>

      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{proveedor.nombre}</h1>
        <p className="text-sm text-muted-foreground">{proveedor.empresa || "Sin empresa registrada"}</p>
      </div>

      <SupplierDetails proveedor={proveedor} stats={stats} />

      <div className="flex flex-col gap-3">
        <h4 className="text-sm font-medium text-muted-foreground">Historial de compras</h4>
        <SupplierPurchaseHistory compras={compras} />
      </div>
    </div>
  );
}
