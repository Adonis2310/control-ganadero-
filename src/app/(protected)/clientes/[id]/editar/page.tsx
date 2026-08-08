import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ClientForm } from "@/features/clientes/components/client-form";
import { createClient } from "@/lib/supabase/server";
import { clientesService } from "@/services/clientes.service";

export const metadata: Metadata = { title: "Editar cliente | Control Ganadero" };

interface EditarClientePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditarClientePage({ params }: EditarClientePageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const cliente = await clientesService.getById(supabase, id);

  if (!cliente) {
    notFound();
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Editar {cliente.nombre}</h1>
        <p className="text-sm text-muted-foreground">Actualiza la información del cliente.</p>
      </div>

      <ClientForm mode="edit" cliente={cliente} />
    </div>
  );
}
