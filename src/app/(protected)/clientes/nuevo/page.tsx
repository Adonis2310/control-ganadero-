import type { Metadata } from "next";

import { ClientForm } from "@/features/clientes/components/client-form";

export const metadata: Metadata = { title: "Nuevo cliente | Control Ganadero" };

export default function NuevoClientePage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Nuevo cliente</h1>
        <p className="text-sm text-muted-foreground">Registra un nuevo cliente de tu finca.</p>
      </div>

      <ClientForm mode="create" />
    </div>
  );
}
