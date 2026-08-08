"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SearchX, Users } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ClientTable } from "@/features/clientes/components/client-table";
import { ClientToolbar } from "@/features/clientes/components/client-toolbar";
import { DeactivateClientDialog } from "@/features/clientes/components/deactivate-client-dialog";
import { useClienteFilters } from "@/features/clientes/hooks/use-cliente-filters";
import type { ClienteRow } from "@/features/clientes/types";
import { createClient } from "@/lib/supabase/client";
import { clientesService } from "@/services/clientes.service";

interface ClientExplorerProps {
  clientesIniciales: ClienteRow[];
  totalesPorCliente: Record<string, number>;
}

export function ClientExplorer({ clientesIniciales, totalesPorCliente }: ClientExplorerProps) {
  const router = useRouter();
  const [clientes, setClientes] = useState(clientesIniciales);
  const [clienteADesactivar, setClienteADesactivar] = useState<ClienteRow | null>(null);

  const { filters, setFilters, filtered, hasActiveFilters, clearFilters } = useClienteFilters(clientes);

  async function handleToggleActivo(cliente: ClienteRow) {
    if (cliente.activo) {
      setClienteADesactivar(cliente);
      return;
    }
    try {
      const supabase = createClient();
      await clientesService.setActivo(supabase, cliente.id, true);
      setClientes((prev) => prev.map((c) => (c.id === cliente.id ? { ...c, activo: true } : c)));
      toast.success("Cliente activado");
      router.refresh();
    } catch {
      toast.error("No se pudo activar el cliente");
    }
  }

  function handleDeactivated(id: string) {
    setClientes((prev) => prev.map((c) => (c.id === id ? { ...c, activo: false } : c)));
    router.refresh();
  }

  if (clientesIniciales.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-20 text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-muted">
          <Users className="size-6 text-muted-foreground" />
        </div>
        <div className="space-y-1">
          <p className="font-medium">No hay clientes registrados.</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Registra tu primer cliente para empezar a llevar el control de tus ventas.
          </p>
        </div>
        <Button nativeButton={false} render={<Link href="/clientes/nuevo" />}>
          + Agregar cliente
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <ClientToolbar
        filters={filters}
        onFiltersChange={setFilters}
        hasActiveFilters={hasActiveFilters}
        onClear={clearFilters}
      />

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-16 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-muted">
            <SearchX className="size-5 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <p className="font-medium">Ningún cliente coincide con la búsqueda</p>
            <p className="text-sm text-muted-foreground">Prueba ajustando los filtros o el término de búsqueda.</p>
          </div>
          <Button variant="outline" onClick={clearFilters}>
            Limpiar filtros
          </Button>
        </div>
      ) : (
        <ClientTable clientes={filtered} totalesPorCliente={totalesPorCliente} onToggleActivo={handleToggleActivo} />
      )}

      <DeactivateClientDialog
        cliente={clienteADesactivar}
        open={clienteADesactivar !== null}
        onOpenChange={(open) => !open && setClienteADesactivar(null)}
        onDeactivated={handleDeactivated}
      />
    </div>
  );
}
