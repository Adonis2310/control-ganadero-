import type { Metadata } from "next";

import { SettingsTabs } from "@/features/configuracion/components/settings-tabs";
import { createClient } from "@/lib/supabase/server";
import { configuracionSistemaService } from "@/services/configuracion-sistema.service";
import { fincaService } from "@/services/finca.service";

export const metadata: Metadata = { title: "Configuración | Control Ganadero" };

export default async function ConfiguracionPage() {
  const supabase = await createClient();
  const [finca, sistema] = await Promise.all([
    fincaService.getOrCreate(supabase),
    configuracionSistemaService.getOrCreate(supabase),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Configuración</h1>
        <p className="text-sm text-muted-foreground">
          Personaliza los datos generales de la finca y las preferencias del sistema.
        </p>
      </div>

      <SettingsTabs finca={finca} sistema={sistema} />
    </div>
  );
}
