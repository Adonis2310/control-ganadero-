import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PesoGeneralExplorer } from "@/features/ganado/components/peso-general-explorer";
import { createClient } from "@/lib/supabase/server";
import { fincaService } from "@/services/finca.service";
import { pesosService } from "@/services/pesos.service";

export const metadata: Metadata = { title: "Control de Peso | Control Ganadero" };

export default async function ControlPesoPage() {
  const supabase = await createClient();
  const finca = await fincaService.getOrCreate(supabase);
  const [pesos, stats] = await Promise.all([
    pesosService.listForFinca(supabase, finca.id),
    pesosService.getGeneralStats(supabase, finca.id),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <Button
        variant="ghost"
        size="sm"
        nativeButton={false}
        render={<Link href="/ganado" />}
        className="w-fit text-muted-foreground"
      >
        <ArrowLeft className="size-4" />
        Volver a Ganado
      </Button>

      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Control de Peso</h1>
        <p className="text-sm text-muted-foreground">
          Consulta los pesajes registrados en toda la finca.
        </p>
      </div>

      <PesoGeneralExplorer pesosIniciales={pesos} stats={stats} />
    </div>
  );
}
