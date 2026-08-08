import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";

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

  return (
    <div className="min-h-svh bg-muted/30">
      <Sidebar />
      <div className="flex min-h-svh flex-col lg:pl-64">
        <Navbar user={user} />
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
