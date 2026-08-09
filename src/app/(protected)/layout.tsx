import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { ConfiguracionProvider } from "@/features/configuracion/hooks/use-configuracion";
import { createClient } from "@/lib/supabase/server";
import { configuracionSistemaService } from "@/services/configuracion-sistema.service";
import { fincaService } from "@/services/finca.service";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // El middleware ya validó la sesión contra Supabase (getUser()) y dejó el
  // email en este header — evita repetir esa llamada de red en cada
  // navegación. Si falta, es que algo bypasseó el middleware; redirigimos
  // por seguridad.
  const email = (await headers()).get("x-user-email");

  if (!email) {
    redirect("/login");
  }

  const user = { email };

  // Configuración global (finca + preferencias del sistema): se carga una
  // sola vez aquí y se distribuye a toda la app vía ConfiguracionProvider,
  // en vez de que cada página/componente vuelva a consultarla (sección 15).
  const supabase = await createClient();
  const [finca, sistema] = await Promise.all([
    fincaService.getOrCreate(supabase),
    configuracionSistemaService.getOrCreate(supabase),
  ]);

  return (
    <ConfiguracionProvider finca={finca} sistema={sistema}>
      <div className="min-h-svh bg-muted/30">
        <Sidebar />
        <div className="flex min-h-svh flex-col lg:pl-64 print:pl-0">
          <Navbar user={user} />
          <main className="flex-1 p-4 lg:p-6 print:p-0">{children}</main>
        </div>
      </div>
    </ConfiguracionProvider>
  );
}
