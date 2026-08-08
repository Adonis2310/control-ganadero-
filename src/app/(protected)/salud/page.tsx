import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SaludGeneralExplorer } from "@/features/ganado/components/salud-general-explorer";
import { createClient } from "@/lib/supabase/server";
import { animalesService } from "@/services/animales.service";
import { fincaService } from "@/services/finca.service";
import { saludService } from "@/services/salud.service";

export const metadata: Metadata = { title: "Salud | Control Ganadero" };

export default async function SaludGeneralPage() {
  const supabase = await createClient();
  const finca = await fincaService.getOrCreate(supabase);
  const [registros, alertas, animales] = await Promise.all([
    saludService.listRegistrosFinca(supabase, finca.id),
    saludService.getDashboardAlerts(supabase, finca.id),
    animalesService.listAll(supabase, finca.id),
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
        <h1 className="text-2xl font-semibold tracking-tight">Salud</h1>
        <p className="text-sm text-muted-foreground">
          Consulta el estado sanitario de toda la finca.
        </p>
      </div>

      <SaludGeneralExplorer registrosIniciales={registros} alertas={alertas} animales={animales} />
    </div>
  );
}
