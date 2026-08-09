import Link from "next/link";
import { Beef, ChevronRight, Store, Wallet } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const ACCESOS = [
  { titulo: "Reporte de ganado", href: "/reportes", icon: Beef },
  { titulo: "Reporte financiero", href: "/reportes", icon: Wallet },
  { titulo: "Reporte de ventas", href: "/reportes", icon: Store },
];

/** Accesos rápidos a Reportes desde el Dashboard (sección 19): no reemplaza el Dashboard, solo agrega un enlace. */
export function ReportsQuickAccess() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
        <div>
          <CardTitle>Reportes</CardTitle>
          <CardDescription>Análisis y estadísticas de la finca</CardDescription>
        </div>
        <Button variant="ghost" size="sm" nativeButton={false} render={<Link href="/reportes" />}>
          Ver todos los reportes
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col gap-1.5">
        {ACCESOS.map((acceso) => (
          <Link
            key={acceso.titulo}
            href={acceso.href}
            className="flex items-center justify-between gap-2 rounded-lg border p-2.5 text-sm hover:bg-muted/50"
          >
            <span className="flex items-center gap-2">
              <acceso.icon className="size-4 text-muted-foreground" />
              {acceso.titulo}
            </span>
            <ChevronRight className="size-4 text-muted-foreground" />
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
