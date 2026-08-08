import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ClientDetails, ClientPurchaseHistory } from "@/features/clientes/components/client-details";
import { calcularClienteStats } from "@/features/clientes/utils/cliente.utils";
import { createClient } from "@/lib/supabase/server";
import { clientesService } from "@/services/clientes.service";
import { ventasService } from "@/services/ventas.service";

interface ClienteDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ClienteDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const cliente = await clientesService.getById(supabase, id);
  return {
    title: cliente ? `${cliente.nombre} | Control Ganadero` : "Cliente no encontrado | Control Ganadero",
  };
}

export default async function ClienteDetailPage({ params }: ClienteDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const cliente = await clientesService.getById(supabase, id);

  if (!cliente) {
    notFound();
  }

  const ventas = await ventasService.listByCliente(supabase, cliente.id);
  const stats = calcularClienteStats(ventas);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          nativeButton={false}
          render={<Link href="/clientes" />}
          className="w-fit text-muted-foreground"
        >
          <ArrowLeft className="size-4" />
          Volver a Clientes
        </Button>
        <Button variant="outline" size="sm" nativeButton={false} render={<Link href={`/clientes/${cliente.id}/editar`} />}>
          <Pencil className="size-4" />
          Editar
        </Button>
      </div>

      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{cliente.nombre}</h1>
        <p className="text-sm text-muted-foreground">{cliente.identificacion || "Sin identificación registrada"}</p>
      </div>

      <ClientDetails cliente={cliente} stats={stats} />

      <div className="flex flex-col gap-3">
        <h4 className="text-sm font-medium text-muted-foreground">Historial de compras</h4>
        <ClientPurchaseHistory ventas={ventas} />
      </div>
    </div>
  );
}
